'use server';

import { auth } from '@clerk/nextjs/server';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import { bankMovementSchema, type BankMovementFormData } from '../../shared/validators';

// Tipo para el cliente de transacción de Prisma
type PrismaTransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Crea un nuevo movimiento bancario y genera asiento contable
 */
export async function createBankMovement(data: BankMovementFormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Validar datos
    const validated = bankMovementSchema.parse(data);

    // Verificar que la cuenta bancaria existe y está activa
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: validated.bankAccountId,
        companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        balance: true,
        accountId: true,
      },
    });

    if (!bankAccount) {
      throw new Error('Cuenta bancaria no encontrada o inactiva');
    }

    // Verificar que la cuenta contable contrapartida existe
    const counterpartAccount = await prisma.account.findFirst({
      where: {
        id: validated.accountId,
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!counterpartAccount) {
      throw new Error('Cuenta contable no encontrada o inactiva');
    }

    const amount = new Prisma.Decimal(validated.amount);
    const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'].includes(validated.type);

    // Crear movimiento, actualizar saldo y generar asiento en transacción
    const movement = await prisma.$transaction(async (tx) => {
      // Calcular nuevo saldo
      let newBalance = bankAccount.balance;

      if (isIncome) {
        newBalance = bankAccount.balance.add(amount);
      } else if (['WITHDRAWAL', 'TRANSFER_OUT', 'CHECK', 'DEBIT', 'FEE'].includes(validated.type)) {
        newBalance = bankAccount.balance.sub(amount);
      }

      // Crear movimiento
      const newMovement = await tx.bankMovement.create({
        data: {
          bankAccountId: validated.bankAccountId,
          companyId,
          type: validated.type,
          amount,
          date: validated.date,
          description: validated.description,
          reference: validated.reference || null,
          statementNumber: validated.statementNumber || null,
          createdBy: userId,
        },
      });

      // Actualizar saldo de la cuenta
      await tx.bankAccount.update({
        where: { id: validated.bankAccountId },
        data: { balance: newBalance },
      });

      // Generar asiento contable si la cuenta bancaria tiene cuenta contable vinculada
      if (bankAccount.accountId) {
        await createJournalEntryForBankMovement(
          {
            companyId,
            date: validated.date,
            description: validated.description,
            amount: parseFloat(validated.amount),
            isIncome,
            bankAccountId: bankAccount.accountId,
            counterpartAccountId: validated.accountId,
            bankName: bankAccount.bankName,
            accountNumber: bankAccount.accountNumber,
          },
          tx
        );
      }

      return newMovement;
    });

    logger.info('Movimiento bancario creado', {
      data: {
        movementId: movement.id,
        type: movement.type,
        amount: validated.amount,
        bankAccount: `${bankAccount.bankName} - ${bankAccount.accountNumber}`,
        counterpartAccount: `${counterpartAccount.code} - ${counterpartAccount.name}`,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/bank-accounts');

    return { success: true, data: movement };
  } catch (error) {
    logger.error('Error al crear movimiento bancario', { data: { error } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al crear movimiento bancario');
  }
}

/**
 * Genera asiento contable para un movimiento bancario manual
 */
async function createJournalEntryForBankMovement(
  input: {
    companyId: string;
    date: Date;
    description: string;
    amount: number;
    isIncome: boolean;
    bankAccountId: string;
    counterpartAccountId: string;
    bankName: string;
    accountNumber: string;
  },
  tx: PrismaTransactionClient
) {
  const { companyId, date, description, amount, isIncome, bankAccountId, counterpartAccountId, bankName, accountNumber } = input;

  // Obtener settings para el siguiente número de asiento
  const settings = await tx.accountingSettings.findUnique({
    where: { companyId },
    select: { lastEntryNumber: true },
  });

  if (!settings) {
    logger.warn('No se encontró configuración contable, no se generará asiento', {
      data: { companyId },
    });
    return;
  }

  const nextNumber = settings.lastEntryNumber + 1;
  const bankLabel = `${bankName} - ${accountNumber}`;

  // Crear asiento:
  // Ingreso (DEPOSIT, TRANSFER_IN, INTEREST):
  //   Debe: Cuenta bancaria (activo aumenta)
  //   Haber: Cuenta contrapartida
  // Egreso (WITHDRAWAL, TRANSFER_OUT, CHECK, DEBIT, FEE):
  //   Debe: Cuenta contrapartida
  //   Haber: Cuenta bancaria (activo disminuye)
  const entry = await tx.journalEntry.create({
    data: {
      companyId,
      number: nextNumber,
      date,
      description: `Mov. bancario - ${description} (${bankLabel})`,
      createdBy: 'system',
      lines: {
        create: isIncome
          ? [
              {
                accountId: bankAccountId,
                debit: new Prisma.Decimal(amount),
                credit: new Prisma.Decimal(0),
                description: `${bankLabel} - ${description}`,
              },
              {
                accountId: counterpartAccountId,
                debit: new Prisma.Decimal(0),
                credit: new Prisma.Decimal(amount),
                description: description,
              },
            ]
          : [
              {
                accountId: counterpartAccountId,
                debit: new Prisma.Decimal(amount),
                credit: new Prisma.Decimal(0),
                description: description,
              },
              {
                accountId: bankAccountId,
                debit: new Prisma.Decimal(0),
                credit: new Prisma.Decimal(amount),
                description: `${bankLabel} - ${description}`,
              },
            ],
      },
    },
  });

  // Actualizar el último número de asiento
  await tx.accountingSettings.update({
    where: { companyId },
    data: { lastEntryNumber: nextNumber },
  });

  logger.info('Asiento contable generado para movimiento bancario', {
    data: { entryId: entry.id, number: nextNumber },
  });
}

/**
 * Obtiene los movimientos de una cuenta bancaria
 */
export async function getBankAccountMovements(bankAccountId: string, limit = 50) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const movements = await prisma.bankMovement.findMany({
      where: {
        bankAccountId,
        companyId,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        description: true,
        reference: true,
        statementNumber: true,
        reconciled: true,
        reconciledAt: true,
        createdBy: true,
        createdAt: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return movements.map((m) => ({
      ...m,
      amount: Number(m.amount),
    }));
  } catch (error) {
    logger.error('Error al obtener movimientos bancarios', { data: { error, bankAccountId } });
    throw new Error('Error al obtener movimientos bancarios');
  }
}

/**
 * Obtiene las cuentas contables disponibles para movimientos bancarios
 */
export async function getAccountsForBankMovement() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const accounts = await prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
      },
      orderBy: { code: 'asc' },
    });

    return accounts;
  } catch (error) {
    logger.error('Error al obtener cuentas contables', { data: { error } });
    return [];
  }
}

/**
 * Concilia un movimiento bancario
 */
export async function reconcileBankMovement(movementId: string, reconcile: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el movimiento existe
    const movement = await prisma.bankMovement.findFirst({
      where: {
        id: movementId,
        companyId,
      },
      select: {
        id: true,
        reconciled: true,
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!movement) {
      throw new Error('Movimiento no encontrado');
    }

    // No hacer nada si ya está en el estado deseado
    if (movement.reconciled === reconcile) {
      return { success: true, data: movement };
    }

    // Actualizar estado de conciliación
    const updated = await prisma.bankMovement.update({
      where: { id: movementId },
      data: {
        reconciled: reconcile,
        reconciledAt: reconcile ? new Date() : null,
        reconciledBy: reconcile ? userId : null,
      },
    });

    logger.info(`Movimiento bancario ${reconcile ? 'conciliado' : 'desconciliado'}`, {
      data: {
        movementId,
        bankAccount: `${movement.bankAccount.bankName} - ${movement.bankAccount.accountNumber}`,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/bank-accounts');

    return { success: true, data: updated };
  } catch (error) {
    logger.error('Error al conciliar movimiento', { data: { error, movementId } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al conciliar movimiento');
  }
}

/**
 * Concilia múltiples movimientos bancarios
 */
export async function reconcileMultipleBankMovements(movementIds: string[], reconcile: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Actualizar todos los movimientos
    const result = await prisma.bankMovement.updateMany({
      where: {
        id: { in: movementIds },
        companyId,
      },
      data: {
        reconciled: reconcile,
        reconciledAt: reconcile ? new Date() : null,
        reconciledBy: reconcile ? userId : null,
      },
    });

    logger.info(`${result.count} movimientos bancarios ${reconcile ? 'conciliados' : 'desconciliados'}`, {
      data: { count: result.count },
    });

    revalidatePath('/dashboard/commercial/treasury/bank-accounts');

    return { success: true, count: result.count };
  } catch (error) {
    logger.error('Error al conciliar movimientos', { data: { error, movementIds } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al conciliar movimientos');
  }
}

/**
 * Elimina un movimiento bancario (solo si no está conciliado)
 */
export async function deleteBankMovement(movementId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el movimiento existe y no está conciliado
    const movement = await prisma.bankMovement.findFirst({
      where: {
        id: movementId,
        companyId,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        reconciled: true,
        bankAccount: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });

    if (!movement) {
      throw new Error('Movimiento no encontrado');
    }

    if (movement.reconciled) {
      throw new Error('No se puede eliminar un movimiento conciliado');
    }

    // Eliminar movimiento y actualizar saldo en transacción
    await prisma.$transaction(async (tx) => {
      // Calcular nuevo saldo (revertir el movimiento)
      let newBalance = movement.bankAccount.balance;

      // Movimientos que aumentan el saldo (al revertir, disminuyen)
      if (['DEPOSIT', 'TRANSFER_IN', 'INTEREST'].includes(movement.type)) {
        newBalance = movement.bankAccount.balance.sub(movement.amount);
      }
      // Movimientos que disminuyen el saldo (al revertir, aumentan)
      else if (['WITHDRAWAL', 'TRANSFER_OUT', 'CHECK', 'DEBIT', 'FEE'].includes(movement.type)) {
        newBalance = movement.bankAccount.balance.add(movement.amount);
      }

      // Actualizar saldo
      await tx.bankAccount.update({
        where: { id: movement.bankAccount.id },
        data: { balance: newBalance },
      });

      // Eliminar movimiento
      await tx.bankMovement.delete({
        where: { id: movementId },
      });
    });

    logger.info('Movimiento bancario eliminado', {
      data: {
        movementId,
        type: movement.type,
        amount: Number(movement.amount),
      },
    });

    revalidatePath('/dashboard/commercial/treasury/bank-accounts');

    return { success: true };
  } catch (error) {
    logger.error('Error al eliminar movimiento bancario', { data: { error, movementId } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al eliminar movimiento bancario');
  }
}

/**
 * Obtiene estadísticas de conciliación
 */
export async function getReconciliationStats(bankAccountId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const [total, reconciled, pending] = await Promise.all([
      prisma.bankMovement.count({
        where: { bankAccountId, companyId },
      }),
      prisma.bankMovement.count({
        where: { bankAccountId, companyId, reconciled: true },
      }),
      prisma.bankMovement.count({
        where: { bankAccountId, companyId, reconciled: false },
      }),
    ]);

    return {
      total,
      reconciled,
      pending,
      percentage: total > 0 ? Math.round((reconciled / total) * 100) : 0,
    };
  } catch (error) {
    logger.error('Error al obtener estadísticas de conciliación', { data: { error, bankAccountId } });
    throw new Error('Error al obtener estadísticas');
  }
}
