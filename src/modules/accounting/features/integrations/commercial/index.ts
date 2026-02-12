/**
 * Integración automática del módulo comercial con contabilidad
 *
 * Este módulo genera asientos contables automáticamente cuando se confirman
 * documentos comerciales (facturas, recibos, órdenes de pago).
 *
 * Esquema de asientos:
 *
 * 1. Factura de Venta (confirmada):
 *    - Debe: Cuentas por Cobrar
 *    - Haber: Ventas + IVA Débito Fiscal
 *
 * 2. Factura de Compra (confirmada):
 *    - Debe: Compras + IVA Crédito Fiscal
 *    - Haber: Cuentas por Pagar
 *
 * 3. Recibo de Cobro (confirmado):
 *    - Debe: Caja/Banco
 *    - Haber: Cuentas por Cobrar
 *
 * 4. Orden de Pago (confirmada):
 *    - Debe: Cuentas por Pagar
 *    - Haber: Caja/Banco
 */

import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

// Tipo para el cliente de transacción de Prisma
type PrismaTransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// ============================================
// TIPOS
// ============================================

interface JournalEntryLineInput {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

interface CreateJournalEntryInput {
  companyId: string;
  date: Date;
  description: string;
  lines: JournalEntryLineInput[];
}

// ============================================
// HELPER: Obtener configuración contable
// ============================================

async function getAccountingSettings(companyId: string, tx?: PrismaTransactionClient) {
  const client = tx || prisma;

  const settings = await client.accountingSettings.findUnique({
    where: { companyId },
    include: {
      salesAccount: true,
      purchasesAccount: true,
      receivablesAccount: true,
      payablesAccount: true,
      vatDebitAccount: true,
      vatCreditAccount: true,
      defaultCashAccount: true,
      defaultBankAccount: true,
    },
  });

  if (!settings) {
    throw new Error('No se encontró configuración contable para la empresa');
  }

  return settings;
}

// ============================================
// HELPER: Validar balance del asiento
// ============================================

function validateBalance(lines: JournalEntryLineInput[]): void {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

  // Permitir diferencia de centavos por redondeo
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `El asiento no está balanceado. Debe: ${totalDebit.toFixed(2)}, Haber: ${totalCredit.toFixed(2)}`
    );
  }
}

// ============================================
// HELPER: Crear asiento contable
// ============================================

async function createJournalEntry(
  input: CreateJournalEntryInput,
  tx: PrismaTransactionClient
): Promise<string> {
  const { companyId, date, description, lines } = input;

  // Validar balance
  validateBalance(lines);

  // Obtener settings para el siguiente número de asiento
  const settings = await tx.accountingSettings.findUnique({
    where: { companyId },
    select: { lastEntryNumber: true },
  });

  if (!settings) {
    throw new Error('No se encontró configuración contable');
  }

  const nextNumber = settings.lastEntryNumber + 1;

  // Crear asiento
  const entry = await tx.journalEntry.create({
    data: {
      companyId,
      number: nextNumber,
      date,
      description,
      createdBy: 'system', // System-generated entry
      lines: {
        create: lines.map((line) => ({
          accountId: line.accountId,
          debit: new Prisma.Decimal(line.debit),
          credit: new Prisma.Decimal(line.credit),
          description: line.description,
        })),
      },
    },
  });

  // Actualizar el último número de asiento
  await tx.accountingSettings.update({
    where: { companyId },
    data: { lastEntryNumber: nextNumber },
  });

  logger.info('Asiento contable creado automáticamente', {
    data: {
      entryId: entry.id,
      number: nextNumber,
      totalDebit: lines.reduce((sum, line) => sum + line.debit, 0),
      totalCredit: lines.reduce((sum, line) => sum + line.credit, 0),
    },
  });

  return entry.id;
}

// ============================================
// INTEGRACIÓN: Factura de Venta
// ============================================

export async function createJournalEntryForSalesInvoice(
  invoiceId: string,
  companyId: string,
  tx: PrismaTransactionClient
): Promise<string | null> {
  try {
    const settings = await getAccountingSettings(companyId, tx);

    // Verificar que estén configuradas las cuentas necesarias
    if (!settings.receivablesAccountId || !settings.salesAccountId || !settings.vatDebitAccountId) {
      logger.warn('No se puede crear asiento para factura de venta: cuentas no configuradas', {
        data: { invoiceId, companyId },
      });
      return null;
    }

    // Obtener factura
    const invoice = await tx.salesInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        fullNumber: true,
        issueDate: true,
        subtotal: true,
        vatAmount: true,
        total: true,
        customer: { select: { name: true } },
      },
    });

    if (!invoice) {
      throw new Error('Factura de venta no encontrada');
    }

    const subtotal = parseFloat(invoice.subtotal.toString());
    const vatAmount = parseFloat(invoice.vatAmount.toString());
    const total = parseFloat(invoice.total.toString());

    const lines: JournalEntryLineInput[] = [
      // Debe: Cuentas por Cobrar (activo aumenta)
      {
        accountId: settings.receivablesAccountId,
        debit: total,
        credit: 0,
        description: `Factura de venta ${invoice.fullNumber} - ${invoice.customer.name}`,
      },
      // Haber: Ventas (ingreso)
      {
        accountId: settings.salesAccountId,
        debit: 0,
        credit: subtotal,
        description: `Ventas - ${invoice.fullNumber}`,
      },
      // Haber: IVA Débito Fiscal (pasivo aumenta)
      {
        accountId: settings.vatDebitAccountId,
        debit: 0,
        credit: vatAmount,
        description: `IVA Débito Fiscal - ${invoice.fullNumber}`,
      },
    ];

    const entryId = await createJournalEntry(
      {
        companyId,
        date: invoice.issueDate,
        description: `Factura de venta ${invoice.fullNumber}`,
        lines,
      },
      tx
    );

    return entryId;
  } catch (error) {
    logger.error('Error al crear asiento para factura de venta', {
      data: { error, invoiceId, companyId },
    });
    throw error;
  }
}

// ============================================
// INTEGRACIÓN: Factura de Compra
// ============================================

export async function createJournalEntryForPurchaseInvoice(
  invoiceId: string,
  companyId: string,
  tx: PrismaTransactionClient
): Promise<string | null> {
  try {
    const settings = await getAccountingSettings(companyId, tx);

    // Verificar que estén configuradas las cuentas necesarias
    if (!settings.payablesAccountId || !settings.purchasesAccountId || !settings.vatCreditAccountId) {
      logger.warn('No se puede crear asiento para factura de compra: cuentas no configuradas', {
        data: { invoiceId, companyId },
      });
      return null;
    }

    // Obtener factura
    const invoice = await tx.purchaseInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        number: true,
        issueDate: true,
        subtotal: true,
        vatAmount: true,
        total: true,
        supplier: { select: { businessName: true } },
      },
    });

    if (!invoice) {
      throw new Error('Factura de compra no encontrada');
    }

    const subtotal = parseFloat(invoice.subtotal.toString());
    const vatAmount = parseFloat(invoice.vatAmount.toString());
    const total = parseFloat(invoice.total.toString());

    const lines: JournalEntryLineInput[] = [
      // Debe: Compras (gasto)
      {
        accountId: settings.purchasesAccountId,
        debit: subtotal,
        credit: 0,
        description: `Compras - ${invoice.number}`,
      },
      // Debe: IVA Crédito Fiscal (activo aumenta)
      {
        accountId: settings.vatCreditAccountId,
        debit: vatAmount,
        credit: 0,
        description: `IVA Crédito Fiscal - ${invoice.number}`,
      },
      // Haber: Cuentas por Pagar (pasivo aumenta)
      {
        accountId: settings.payablesAccountId,
        debit: 0,
        credit: total,
        description: `Factura de compra ${invoice.number} - ${invoice.supplier.businessName}`,
      },
    ];

    const entryId = await createJournalEntry(
      {
        companyId,
        date: invoice.issueDate,
        description: `Factura de compra ${invoice.number}`,
        lines,
      },
      tx
    );

    return entryId;
  } catch (error) {
    logger.error('Error al crear asiento para factura de compra', {
      data: { error, invoiceId, companyId },
    });
    throw error;
  }
}

// ============================================
// INTEGRACIÓN: Recibo de Cobro
// ============================================

export async function createJournalEntryForReceipt(
  receiptId: string,
  companyId: string,
  tx: PrismaTransactionClient
): Promise<string | null> {
  try {
    const settings = await getAccountingSettings(companyId, tx);

    // Verificar cuenta de cuentas por cobrar
    if (!settings.receivablesAccountId) {
      logger.warn('No se puede crear asiento para recibo: cuenta de cuentas por cobrar no configurada', {
        data: { receiptId, companyId },
      });
      return null;
    }

    // Obtener recibo con sus pagos
    const receipt = await tx.receipt.findUnique({
      where: { id: receiptId },
      select: {
        fullNumber: true,
        date: true,
        totalAmount: true,
        customer: { select: { name: true } },
        payments: {
          select: {
            amount: true,
            cashRegisterId: true,
            bankAccountId: true,
            cashRegister: { select: { accountId: true } },
            bankAccount: { select: { accountId: true } },
          },
        },
      },
    });

    if (!receipt) {
      throw new Error('Recibo de cobro no encontrado');
    }

    const total = parseFloat(receipt.totalAmount.toString());
    const lines: JournalEntryLineInput[] = [];

    // Haber: Cuentas por Cobrar (activo disminuye)
    lines.push({
      accountId: settings.receivablesAccountId,
      debit: 0,
      credit: total,
      description: `Recibo de cobro ${receipt.fullNumber} - ${receipt.customer.name}`,
    });

    // Debe: Caja/Banco (activo aumenta)
    for (const payment of receipt.payments) {
      const amount = parseFloat(payment.amount.toString());
      let accountId: string | null = null;

      if (payment.cashRegisterId && payment.cashRegister?.accountId) {
        accountId = payment.cashRegister.accountId;
      } else if (payment.bankAccountId && payment.bankAccount?.accountId) {
        accountId = payment.bankAccount.accountId;
      } else if (payment.cashRegisterId && settings.defaultCashAccountId) {
        accountId = settings.defaultCashAccountId;
      } else if (payment.bankAccountId && settings.defaultBankAccountId) {
        accountId = settings.defaultBankAccountId;
      }

      if (!accountId) {
        logger.warn('No se encontró cuenta contable para el pago', {
          data: { receiptId, paymentCashRegisterId: payment.cashRegisterId, paymentBankAccountId: payment.bankAccountId },
        });
        continue;
      }

      lines.push({
        accountId,
        debit: amount,
        credit: 0,
        description: payment.cashRegisterId
          ? `Cobro en efectivo - ${receipt.fullNumber}`
          : `Cobro bancario - ${receipt.fullNumber}`,
      });
    }

    if (lines.length < 2) {
      logger.warn('No se pudieron crear líneas suficientes para el recibo', {
        data: { receiptId },
      });
      return null;
    }

    const entryId = await createJournalEntry(
      {
        companyId,
        date: receipt.date,
        description: `Recibo de cobro ${receipt.fullNumber}`,
        lines,
      },
      tx
    );

    return entryId;
  } catch (error) {
    logger.error('Error al crear asiento para recibo', {
      data: { error, receiptId, companyId },
    });
    throw error;
  }
}

// ============================================
// INTEGRACIÓN: Orden de Pago
// ============================================

export async function createJournalEntryForPaymentOrder(
  paymentOrderId: string,
  companyId: string,
  tx: PrismaTransactionClient
): Promise<string | null> {
  try {
    const settings = await getAccountingSettings(companyId, tx);

    // Verificar cuenta de cuentas por pagar
    if (!settings.payablesAccountId) {
      logger.warn('No se puede crear asiento para orden de pago: cuenta de cuentas por pagar no configurada', {
        data: { paymentOrderId, companyId },
      });
      return null;
    }

    // Obtener orden de pago con sus pagos
    const paymentOrder = await tx.paymentOrder.findUnique({
      where: { id: paymentOrderId },
      select: {
        fullNumber: true,
        date: true,
        totalAmount: true,
        supplier: {
          select: {
            businessName: true,
            tradeName: true,
          }
        },
        payments: {
          select: {
            amount: true,
            cashRegisterId: true,
            bankAccountId: true,
            cashRegister: { select: { accountId: true } },
            bankAccount: { select: { accountId: true } },
          },
        },
      },
    });

    if (!paymentOrder) {
      throw new Error('Orden de pago no encontrada');
    }

    const total = parseFloat(paymentOrder.totalAmount.toString());
    const lines: JournalEntryLineInput[] = [];

    // Debe: Cuentas por Pagar (pasivo disminuye)
    lines.push({
      accountId: settings.payablesAccountId,
      debit: total,
      credit: 0,
      description: `Orden de pago ${paymentOrder.fullNumber} - ${paymentOrder.supplier.tradeName || paymentOrder.supplier.businessName}`,
    });

    // Haber: Caja/Banco (activo disminuye)
    for (const payment of paymentOrder.payments) {
      const amount = parseFloat(payment.amount.toString());
      let accountId: string | null = null;

      if (payment.cashRegisterId && payment.cashRegister?.accountId) {
        accountId = payment.cashRegister.accountId;
      } else if (payment.bankAccountId && payment.bankAccount?.accountId) {
        accountId = payment.bankAccount.accountId;
      } else if (payment.cashRegisterId && settings.defaultCashAccountId) {
        accountId = settings.defaultCashAccountId;
      } else if (payment.bankAccountId && settings.defaultBankAccountId) {
        accountId = settings.defaultBankAccountId;
      }

      if (!accountId) {
        logger.warn('No se encontró cuenta contable para el pago', {
          data: { paymentOrderId, paymentCashRegisterId: payment.cashRegisterId, paymentBankAccountId: payment.bankAccountId },
        });
        continue;
      }

      lines.push({
        accountId,
        debit: 0,
        credit: amount,
        description: payment.cashRegisterId
          ? `Pago en efectivo - ${paymentOrder.fullNumber}`
          : `Pago bancario - ${paymentOrder.fullNumber}`,
      });
    }

    if (lines.length < 2) {
      logger.warn('No se pudieron crear líneas suficientes para la orden de pago', {
        data: { paymentOrderId },
      });
      return null;
    }

    const entryId = await createJournalEntry(
      {
        companyId,
        date: paymentOrder.date,
        description: `Orden de pago ${paymentOrder.fullNumber}`,
        lines,
      },
      tx
    );

    return entryId;
  } catch (error) {
    logger.error('Error al crear asiento para orden de pago', {
      data: { error, paymentOrderId, companyId },
    });
    throw error;
  }
}
