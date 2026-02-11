'use server';

import { auth } from '@clerk/nextjs/server';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import type { CreatePaymentOrderFormData } from '../../shared/validators';
import type { PendingPurchaseInvoice, PaymentOrderListItem, PaymentOrderWithDetails } from '../../shared/types';
import { createJournalEntryForPaymentOrder } from '@/modules/accounting/features/integrations/commercial';

/**
 * Obtiene las facturas pendientes de pago de un proveedor
 */
export async function getPendingPurchaseInvoices(supplierId: string): Promise<PendingPurchaseInvoice[]> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoices = await prisma.purchaseInvoice.findMany({
      where: {
        companyId,
        supplierId,
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
        paymentOrderItems: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { issueDate: 'asc' },
    });

    return invoices.map((invoice) => {
      const paidAmount = invoice.paymentOrderItems.reduce((sum, item) => sum + Number(item.amount), 0);
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
    logger.error('Error al obtener facturas pendientes de pago', { data: { error, supplierId } });
    throw new Error('Error al obtener facturas pendientes de pago');
  }
}

/**
 * Crea una nueva orden de pago (borrador)
 */
export async function createPaymentOrder(data: CreatePaymentOrderFormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener el siguiente número de orden de pago
    const lastPaymentOrder = await prisma.paymentOrder.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const nextNumber = (lastPaymentOrder?.number ?? 0) + 1;
    const fullNumber = `OP-${String(nextNumber).padStart(5, '0')}`;

    // Calcular total
    const totalAmount = data.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // Crear orden de pago con items y pagos en transacción
    const paymentOrder = await prisma.$transaction(async (tx) => {
      // Crear orden de pago
      const newPaymentOrder = await tx.paymentOrder.create({
        data: {
          companyId,
          supplierId: data.supplierId,
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
      await tx.paymentOrderItem.createMany({
        data: data.items.map((item) => ({
          paymentOrderId: newPaymentOrder.id,
          invoiceId: item.invoiceId,
          amount: new Prisma.Decimal(item.amount),
        })),
      });

      // Crear pagos
      await tx.paymentOrderPayment.createMany({
        data: data.payments.map((payment) => ({
          paymentOrderId: newPaymentOrder.id,
          paymentMethod: payment.paymentMethod,
          amount: new Prisma.Decimal(payment.amount),
          cashRegisterId: payment.cashRegisterId || null,
          bankAccountId: payment.bankAccountId || null,
          checkNumber: payment.checkNumber || null,
          cardLast4: payment.cardLast4 || null,
          reference: payment.reference || null,
        })),
      });

      return newPaymentOrder;
    });

    logger.info('Orden de pago creada', {
      data: {
        paymentOrderId: paymentOrder.id,
        fullNumber: paymentOrder.fullNumber,
        totalAmount: totalAmount,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/payment-orders');

    return { success: true, data: paymentOrder };
  } catch (error) {
    logger.error('Error al crear orden de pago', { data: { error } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al crear orden de pago');
  }
}

/**
 * Confirma una orden de pago (actualiza facturas y crea movimientos)
 */
export async function confirmPaymentOrder(paymentOrderId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener orden de pago con todos sus datos
    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: {
        id: paymentOrderId,
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

    if (!paymentOrder) {
      throw new Error('Orden de pago no encontrada o ya confirmada');
    }

    // Confirmar orden de pago y procesar en transacción
    await prisma.$transaction(async (tx) => {
      // 1. Confirmar orden de pago
      await tx.paymentOrder.update({
        where: { id: paymentOrderId },
        data: {
          status: 'CONFIRMED',
          confirmedBy: userId,
          confirmedAt: new Date(),
        },
      });

      // 2. Actualizar estado de facturas
      for (const item of paymentOrder.items) {
        const invoice = item.invoice;

        // Calcular total pagado (incluye pagos anteriores + esta orden)
        const existingPayments = await tx.paymentOrderItem.aggregate({
          where: { invoiceId: item.invoiceId },
          _sum: { amount: true },
        });

        const totalPaid = Number(existingPayments._sum.amount || 0);
        const invoiceTotal = Number(invoice.total);

        // Actualizar estado según si está totalmente pagada
        const newStatus = totalPaid >= invoiceTotal ? 'PAID' : 'PARTIAL_PAID';

        await tx.purchaseInvoice.update({
          where: { id: item.invoiceId },
          data: { status: newStatus },
        });
      }

      // 3. Crear movimientos de caja/banco según formas de pago
      for (const payment of paymentOrder.payments) {
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

          // Movimiento de caja (EXPENSE)
          await tx.cashMovement.create({
            data: {
              companyId,
              cashRegisterId: payment.cashRegisterId,
              sessionId: activeSession.id,
              type: 'EXPENSE',
              amount: payment.amount,
              date: paymentOrder.date,
              description: `Pago de ${paymentOrder.fullNumber}`,
              reference: paymentOrder.fullNumber,
              createdBy: userId,
            },
          });

          // Actualizar saldo esperado de la sesión (restar)
          await tx.cashRegisterSession.update({
            where: { id: activeSession.id },
            data: {
              expectedBalance: {
                decrement: payment.amount,
              },
            },
          });
        } else if (payment.bankAccountId) {
          // Movimiento bancario (WITHDRAWAL)
          const bankAccount = await tx.bankAccount.findUnique({
            where: { id: payment.bankAccountId },
            select: { balance: true },
          });

          if (bankAccount) {
            await tx.bankMovement.create({
              data: {
                companyId,
                bankAccountId: payment.bankAccountId,
                type: 'WITHDRAWAL',
                amount: payment.amount,
                date: paymentOrder.date,
                description: `Pago de ${paymentOrder.fullNumber}`,
                reference: paymentOrder.fullNumber,
                createdBy: userId,
              },
            });

            // Actualizar saldo (restar)
            await tx.bankAccount.update({
              where: { id: payment.bankAccountId },
              data: {
                balance: bankAccount.balance.sub(payment.amount),
              },
            });
          }
        }
      }

      // Crear asiento contable automáticamente
      try {
        const journalEntryId = await createJournalEntryForPaymentOrder(paymentOrderId, companyId, tx);

        if (journalEntryId) {
          // Actualizar orden de pago con referencia al asiento contable
          await tx.paymentOrder.update({
            where: { id: paymentOrderId },
            data: { journalEntryId },
          });

          logger.info('Asiento contable generado para orden de pago', {
            data: { paymentOrderId, journalEntryId },
          });
        }
      } catch (error) {
        logger.warn('No se pudo generar asiento contable para orden de pago', {
          data: { paymentOrderId, error },
        });
        // No lanzar error para no interrumpir la confirmación de la orden
      }
    });

    logger.info('Orden de pago confirmada', {
      data: {
        paymentOrderId,
        fullNumber: paymentOrder.fullNumber,
      },
    });

    revalidatePath('/dashboard/commercial/treasury/payment-orders');

    return { success: true };
  } catch (error) {
    logger.error('Error al confirmar orden de pago', { data: { error, paymentOrderId } });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al confirmar orden de pago');
  }
}

/**
 * Obtiene la lista de órdenes de pago
 */
export async function getPaymentOrders(params: { supplierId?: string; status?: string } = {}): Promise<PaymentOrderListItem[]> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const paymentOrders = await prisma.paymentOrder.findMany({
      where: {
        companyId,
        ...(params.supplierId && { supplierId: params.supplierId }),
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
        supplier: {
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

    return paymentOrders.map((po) => ({
      ...po,
      totalAmount: Number(po.totalAmount),
    })) as PaymentOrderListItem[];
  } catch (error) {
    logger.error('Error al obtener órdenes de pago', { data: { error } });
    throw new Error('Error al obtener órdenes de pago');
  }
}

/**
 * Obtiene el detalle de una orden de pago
 */
export async function getPaymentOrder(id: string): Promise<PaymentOrderWithDetails> {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const paymentOrder = await prisma.paymentOrder.findFirst({
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
        supplier: {
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

    if (!paymentOrder) {
      throw new Error('Orden de pago no encontrada');
    }

    return {
      ...paymentOrder,
      totalAmount: Number(paymentOrder.totalAmount),
      items: paymentOrder.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
        invoice: {
          ...item.invoice,
          total: Number(item.invoice.total),
        },
      })),
      payments: paymentOrder.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    } as PaymentOrderWithDetails;
  } catch (error) {
    logger.error('Error al obtener orden de pago', { data: { error, id } });
    throw new Error('Error al obtener orden de pago');
  }
}
