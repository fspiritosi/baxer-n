'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import type { Prisma } from '@prisma/client';

/**
 * Obtiene el detalle completo del proveedor con su cuenta corriente
 */
export async function getSupplierAccountStatement(supplierId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('No autenticado');

    const companyId = await getActiveCompanyId();
    if (!companyId) throw new Error('No hay empresa activa');

    // Verificar que el proveedor existe y pertenece a la empresa
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, companyId },
      select: { id: true, businessName: true },
    });

    if (!supplier) {
      throw new Error('Proveedor no encontrado');
    }

    // Obtener facturas de compra
    const purchaseInvoices = await prisma.purchaseInvoice.findMany({
      where: {
        supplierId,
        companyId,
        status: 'CONFIRMED', // Solo facturas confirmadas
      },
      select: {
        id: true,
        fullNumber: true,
        voucherType: true,
        issueDate: true,
        dueDate: true,
        total: true,
        status: true,
        paymentOrderItems: {
          where: {
            paymentOrder: {
              status: 'CONFIRMED', // Solo pagos confirmados
            },
          },
          select: {
            amount: true,
            paymentOrder: {
              select: {
                fullNumber: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    // Obtener órdenes de pago
    const paymentOrders = await prisma.paymentOrder.findMany({
      where: {
        supplierId,
        companyId,
        status: 'CONFIRMED', // Solo pagos confirmados
      },
      select: {
        id: true,
        fullNumber: true,
        date: true,
        totalAmount: true,
        status: true,
        items: {
          select: {
            amount: true,
            invoice: {
              select: {
                fullNumber: true,
                issueDate: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calcular saldos
    const invoicesWithBalance = purchaseInvoices.map((invoice) => {
      const totalPaid = invoice.paymentOrderItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );
      const balance = Number(invoice.total) - totalPaid;

      return {
        id: invoice.id,
        fullNumber: invoice.fullNumber,
        voucherType: invoice.voucherType,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        total: Number(invoice.total),
        paid: totalPaid,
        balance,
        status: invoice.status,
        payments: invoice.paymentOrderItems.map((item) => ({
          amount: Number(item.amount),
          paymentOrderNumber: item.paymentOrder.fullNumber,
          paymentDate: item.paymentOrder.date,
        })),
      };
    });

    const paymentsFormatted = paymentOrders.map((payment) => ({
      id: payment.id,
      fullNumber: payment.fullNumber,
      date: payment.date,
      totalAmount: Number(payment.totalAmount),
      status: payment.status,
      invoices: payment.items.map((item) => ({
        amount: Number(item.amount),
        invoiceNumber: item.invoice.fullNumber,
        invoiceDate: item.invoice.issueDate,
      })),
    }));

    // Calcular totales
    const totalInvoiced = invoicesWithBalance.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoicesWithBalance.reduce((sum, inv) => sum + inv.paid, 0);
    const totalBalance = totalInvoiced - totalPaid;

    logger.info('Cuenta corriente de proveedor obtenida', {
      data: { supplierId, companyId, invoiceCount: invoicesWithBalance.length },
    });

    return {
      supplier: {
        id: supplier.id,
        businessName: supplier.businessName,
      },
      invoices: invoicesWithBalance,
      payments: paymentsFormatted,
      summary: {
        totalInvoiced,
        totalPaid,
        totalBalance,
      },
    };
  } catch (error) {
    logger.error('Error al obtener cuenta corriente de proveedor', {
      data: { supplierId, error },
    });
    throw error;
  }
}

export type SupplierAccountStatement = Awaited<ReturnType<typeof getSupplierAccountStatement>>;
export type SupplierInvoiceWithBalance = SupplierAccountStatement['invoices'][number];
export type SupplierPayment = SupplierAccountStatement['payments'][number];
