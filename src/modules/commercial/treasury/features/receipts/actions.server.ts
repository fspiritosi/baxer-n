'use server';

import { auth } from '@clerk/nextjs/server';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import type { CreateReceiptFormData } from '../../shared/validators';
import type { PendingInvoice, ReceiptListItem, ReceiptWithDetails } from '../../shared/types';

/**
 * Obtiene las facturas pendientes de cobro de un cliente
 */
export async function getPendingInvoices(customerId: string): Promise<PendingInvoice[]> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoices = await prisma.salesInvoice.findMany({
      where: {
        companyId,
        customerId,
        status: {
          in: ['CONFIRMED', 'PARTIAL_PAID'],
        },
      },
      select: {
        id: true,
        fullNumber: true,
        issueDate: true,
        total: true,
        status: true,
        receiptItems: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { issueDate: 'asc' },
    });

    return invoices.map((invoice) => {
      const paidAmount = invoice.receiptItems.reduce((sum, item) => sum + Number(item.amount), 0);
      const total = Number(invoice.total);
      return {
        id: invoice.id,
        fullNumber: invoice.fullNumber,
        issueDate: invoice.issueDate,
        total,
        paidAmount,
        pendingAmount: total - paidAmount,
        status: invoice.status,
      };
    });
  } catch (error) {
    logger.error('Error al obtener facturas pendientes', { data: { error, customerId } });
    throw new Error('Error al obtener facturas pendientes');
  }
}

/**
 * Crea un nuevo recibo de cobro (borrador)
 */
export async function createReceipt(data: CreateReceiptFormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener el siguiente número de recibo
    const lastReceipt = await prisma.receipt.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const nextNumber = (lastReceipt?.number ?? 0) + 1;
    const fullNumber = `R-${String(nextNumber).padStart(5, '0')}`;

    // Calcular total
    const totalAmount = data.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // Crear recibo con items y pagos en transacción
    const receipt = await prisma.$transaction(async (tx) => {
      // Crear recibo
      const newReceipt = await tx.receipt.create({
        data: {
          companyId,
          customerId: data.customerId,
          number: nextNumber,
          fullNumber,
          date: data.date,
          totalAmount: new Prisma.Decimal(totalAmount),
          notes: data.notes || null,
          status: 'DRAFT',
          createdBy: userId,
        },
      });

      // Crear items
      await tx.receiptItem.createMany({
        data: data.items.map((item) => ({
          receiptId: newReceipt.id,
          invoiceId: item.invoiceId,
          amount: new Prisma.Decimal(item.amount),
        })),
      });

      // Crear pagos
      await tx.receiptPayment.createMany({
        data: data.payments.map((payment) => ({
          receiptId: newReceipt.id,
          paymentMethod: payment.paymentMethod,
          amount: new Prisma.Decimal(payment.amount),
          cashRegisterId: payment.cashRegisterId || null,
          bankAccountId: payment.bankAccountId || null,
          checkNumber: payment.checkNumber || null,
          cardLast4: payment.cardLast4 || null,
          reference: payment.reference || null,
        })),
      });

      return newReceipt;
    });

    logger.info('Recibo de cobro creado', {
      data: {
        receiptId: receipt.id,
        fullNumber: receipt.fullNumber,
        totalAmount: totalAmount,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/receipts');

    return { success: true, data: receipt };
  } catch (error) {
    logger.error('Error al crear recibo', { data: { error } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al crear recibo');
  }
}

/**
 * Confirma un recibo de cobro (actualiza facturas y crea movimientos)
 */
export async function confirmReceipt(receiptId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener recibo con todos sus datos
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        companyId,
        status: 'DRAFT',
      },
      include: {
        items: {
          include: {
            invoice: true,
          },
        },
        payments: true,
      },
    });

    if (!receipt) {
      throw new Error('Recibo no encontrado o ya confirmado');
    }

    // Confirmar recibo y procesar en transacción
    await prisma.$transaction(async (tx) => {
      // 1. Confirmar recibo
      await tx.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'CONFIRMED',
          confirmedBy: userId,
          confirmedAt: new Date(),
        },
      });

      // 2. Actualizar estado de facturas
      for (const item of receipt.items) {
        const invoice = item.invoice;

        // Calcular total pagado (incluye pagos anteriores + este recibo)
        const existingPayments = await tx.receiptItem.aggregate({
          where: { invoiceId: item.invoiceId },
          _sum: { amount: true },
        });

        const totalPaid = Number(existingPayments._sum.amount || 0);
        const invoiceTotal = Number(invoice.total);

        // Actualizar estado según si está totalmente pagada
        const newStatus = totalPaid >= invoiceTotal ? 'PAID' : 'PARTIAL_PAID';

        await tx.salesInvoice.update({
          where: { id: item.invoiceId },
          data: { status: newStatus },
        });
      }

      // 3. Crear movimientos de caja/banco según formas de pago
      for (const payment of receipt.payments) {
        if (payment.cashRegisterId) {
          // Obtener sesión activa de la caja
          const activeSession = await tx.cashRegisterSession.findFirst({
            where: {
              cashRegisterId: payment.cashRegisterId,
              status: 'OPEN',
            },
            select: { id: true },
          });

          if (!activeSession) {
            throw new Error('No hay sesión abierta para la caja seleccionada');
          }

          // Movimiento de caja
          await tx.cashMovement.create({
            data: {
              companyId,
              cashRegisterId: payment.cashRegisterId,
              sessionId: activeSession.id,
              type: 'INCOME',
              amount: payment.amount,
              date: receipt.date,
              description: `Cobro de ${receipt.fullNumber}`,
              reference: receipt.fullNumber,
              createdBy: userId,
            },
          });

          // Actualizar saldo esperado de la sesión
          await tx.cashRegisterSession.update({
            where: { id: activeSession.id },
            data: {
              expectedBalance: {
                increment: payment.amount,
              },
            },
          });
        } else if (payment.bankAccountId) {
          // Movimiento bancario
          const bankAccount = await tx.bankAccount.findUnique({
            where: { id: payment.bankAccountId },
            select: { balance: true },
          });

          if (bankAccount) {
            await tx.bankMovement.create({
              data: {
                companyId,
                bankAccountId: payment.bankAccountId,
                type: 'DEPOSIT',
                amount: payment.amount,
                date: receipt.date,
                description: `Cobro de ${receipt.fullNumber}`,
                reference: receipt.fullNumber,
                createdBy: userId,
              },
            });

            // Actualizar saldo
            await tx.bankAccount.update({
              where: { id: payment.bankAccountId },
              data: {
                balance: bankAccount.balance.add(payment.amount),
              },
            });
          }
        }
      }
    });

    logger.info('Recibo de cobro confirmado', {
      data: {
        receiptId,
        fullNumber: receipt.fullNumber,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/receipts');

    return { success: true };
  } catch (error) {
    logger.error('Error al confirmar recibo', { data: { error, receiptId } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al confirmar recibo');
  }
}

/**
 * Obtiene la lista de recibos
 */
export async function getReceipts(params: { customerId?: string; status?: string } = {}): Promise<ReceiptListItem[]> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const receipts = await prisma.receipt.findMany({
      where: {
        companyId,
        ...(params.customerId && { customerId: params.customerId }),
        ...(params.status && { status: params.status as any }),
      },
      select: {
        id: true,
        number: true,
        fullNumber: true,
        date: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            payments: true,
          },
        },
      },
      orderBy: { number: 'desc' },
      take: 100,
    });

    return receipts.map((r) => ({
      ...r,
      totalAmount: Number(r.totalAmount),
    })) as ReceiptListItem[];
  } catch (error) {
    logger.error('Error al obtener recibos', { data: { error } });
    throw new Error('Error al obtener recibos');
  }
}

/**
 * Obtiene el detalle de un recibo
 */
export async function getReceipt(id: string): Promise<ReceiptWithDetails> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const receipt = await prisma.receipt.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        number: true,
        fullNumber: true,
        date: true,
        totalAmount: true,
        notes: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            taxId: true,
          },
        },
        items: {
          select: {
            id: true,
            amount: true,
            invoice: {
              select: {
                id: true,
                fullNumber: true,
                total: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            paymentMethod: true,
            amount: true,
            cashRegister: {
              select: {
                code: true,
                name: true,
              },
            },
            bankAccount: {
              select: {
                bankName: true,
                accountNumber: true,
              },
            },
            checkNumber: true,
            cardLast4: true,
            reference: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new Error('Recibo no encontrado');
    }

    return {
      ...receipt,
      totalAmount: Number(receipt.totalAmount),
      items: receipt.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
        invoice: {
          ...item.invoice,
          total: Number(item.invoice.total),
        },
      })),
      payments: receipt.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    } as ReceiptWithDetails;
  } catch (error) {
    logger.error('Error al obtener recibo', { data: { error, id } });
    throw new Error('Error al obtener recibo');
  }
}

/**
 * Obtiene cajas activas con sesión abierta (para selector de pago)
 */
export async function getAvailableCashRegisters() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const cashRegisters = await prisma.cashRegister.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        sessions: {
          some: {
            status: 'OPEN',
          },
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        sessions: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            expectedBalance: true,
          },
          take: 1,
        },
      },
    });

    return cashRegisters.map((cr) => ({
      id: cr.id,
      code: cr.code,
      name: cr.name,
      sessionId: cr.sessions[0]?.id,
      balance: Number(cr.sessions[0]?.expectedBalance ?? 0),
    }));
  } catch (error) {
    logger.error('Error al obtener cajas disponibles', { data: { error } });
    return [];
  }
}

/**
 * Obtiene cuentas bancarias activas (para selector de pago)
 */
export async function getAvailableBankAccounts() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const accounts = await prisma.bankAccount.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        balance: true,
      },
      orderBy: { bankName: 'asc' },
    });

    return accounts.map((a) => ({
      ...a,
      balance: Number(a.balance),
    }));
  } catch (error) {
    logger.error('Error al obtener cuentas bancarias', { data: { error } });
    return [];
  }
}
