'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';
import { revalidatePath } from 'next/cache';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import {
  buildSearchWhere,
  parseSearchParams,
  stateToPrismaParams,
} from '@/shared/components/common/DataTable/helpers';
import type { PurchaseInvoiceFormInput } from '../shared/validators';
import type { VoucherType } from '@/generated/prisma/enums';
import { createJournalEntryForPurchaseInvoice } from '@/modules/accounting/features/integrations/commercial';

// ============================================
// QUERIES
// ============================================

/**
 * Obtiene facturas de compra con paginación server-side para DataTable
 */
export async function getPurchaseInvoicesPaginated(searchParams: DataTableSearchParams) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const state = parseSearchParams(searchParams);
    const { skip, take, orderBy } = stateToPrismaParams(state);

    const searchWhere = buildSearchWhere(state.search, [
      'fullNumber',
      'notes',
    ]);

    const where = {
      companyId,
      ...searchWhere,
    };

    const [data, total] = await Promise.all([
      prisma.purchaseInvoice.findMany({
        where,
        skip,
        take,
        orderBy: orderBy || { issueDate: 'desc' },
        include: {
          supplier: {
            select: {
              businessName: true,
              tradeName: true,
              taxId: true,
            },
          },
          lines: {
            include: {
              product: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.purchaseInvoice.count({ where }),
    ]);

    return { data, total };
  } catch (error) {
    logger.error('Error al obtener facturas de compra', {
      data: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        companyId
      },
    });
    // Re-throw the original error to see the details
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al obtener facturas de compra');
  }
}

/**
 * Obtiene una factura de compra por ID con todos sus detalles
 */
export async function getPurchaseInvoiceById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unitOfMeasure: true,
              },
            },
          },
        },
        company: {
          select: {
            name: true,
            taxId: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura de compra no encontrada');
    }

    if (invoice.companyId !== companyId) {
      throw new Error('No tienes permiso para ver esta factura');
    }

    return invoice;
  } catch (error) {
    logger.error('Error al obtener factura de compra', {
      data: { error, id, companyId },
    });
    throw error;
  }
}

/**
 * Obtiene proveedores para select (solo activos)
 */
export async function getSuppliersForSelect() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    return await prisma.supplier.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        code: true,
        businessName: true,
        tradeName: true,
        taxId: true,
        taxCondition: true,
      },
      orderBy: { businessName: 'asc' },
    });
  } catch (error) {
    logger.error('Error al obtener proveedores', {
      data: { error, companyId },
    });
    throw new Error('Error al obtener proveedores');
  }
}

/**
 * Obtiene productos para select (solo activos)
 */
export async function getProductsForSelect() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    return await prisma.product.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        unitOfMeasure: true,
        costPrice: true,
        vatRate: true,
        trackStock: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    logger.error('Error al obtener productos', {
      data: { error, companyId },
    });
    throw new Error('Error al obtener productos');
  }
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Crea una nueva factura de compra en estado DRAFT
 */
export async function createPurchaseInvoice(input: PurchaseInvoiceFormInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Calcular totales
    let subtotal = 0;
    let vatAmount = 0;

    const linesData = input.lines.map((line) => {
      const qty = parseFloat(line.quantity);
      const cost = parseFloat(line.unitCost);
      const vat = parseFloat(line.vatRate);

      const lineSubtotal = qty * cost;
      const lineVat = lineSubtotal * (vat / 100);
      const lineTotal = lineSubtotal + lineVat;

      subtotal += lineSubtotal;
      vatAmount += lineVat;

      return {
        productId: line.productId || null,
        description: line.description,
        quantity: qty,
        unitCost: cost,
        vatRate: vat,
        vatAmount: lineVat,
        subtotal: lineSubtotal,
        total: lineTotal,
      };
    });

    const total = subtotal + vatAmount;

    // Verificar que no exista factura duplicada
    const fullNumber = `${input.pointOfSale}-${input.number}`;
    const existing = await prisma.purchaseInvoice.findFirst({
      where: {
        companyId,
        supplierId: input.supplierId,
        fullNumber,
      },
    });

    if (existing) {
      throw new Error(
        `Ya existe una factura de este proveedor con el número ${fullNumber}`
      );
    }

    // Crear factura
    const invoice = await prisma.purchaseInvoice.create({
      data: {
        companyId,
        supplierId: input.supplierId,
        voucherType: input.voucherType as VoucherType,
        pointOfSale: input.pointOfSale,
        number: input.number,
        fullNumber,
        issueDate: input.issueDate,
        dueDate: input.dueDate || null,
        cae: input.cae || null,
        validated: false,
        subtotal,
        vatAmount,
        otherTaxes: 0,
        total,
        notes: input.notes || null,
        status: 'DRAFT',
        createdBy: userId,
        lines: {
          create: linesData,
        },
      },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    logger.info('Factura de compra creada', {
      data: {
        invoiceId: invoice.id,
        fullNumber: invoice.fullNumber,
        supplierId: input.supplierId,
        total,
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/purchases');
    return invoice;
  } catch (error) {
    logger.error('Error al crear factura de compra', {
      data: { error, input, companyId, userId },
    });
    throw error;
  }
}

/**
 * Confirma una factura de compra y actualiza el stock
 */
export async function confirmPurchaseInvoice(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura de compra no encontrada');
    }

    if (invoice.companyId !== companyId) {
      throw new Error('No tienes permiso para confirmar esta factura');
    }

    if (invoice.status !== 'DRAFT') {
      throw new Error('Solo se pueden confirmar facturas en estado borrador');
    }

    // Obtener almacén principal para incrementar stock
    const mainWarehouse = await prisma.warehouse.findFirst({
      where: {
        companyId,
        type: 'MAIN',
        isActive: true,
      },
    });

    if (!mainWarehouse) {
      throw new Error(
        'No se encontró un almacén principal activo. Configura uno antes de confirmar compras.'
      );
    }

    // Confirmar factura y actualizar stock en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar estado de la factura
      const updatedInvoice = await tx.purchaseInvoice.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
        },
        include: {
          supplier: true,
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      // Actualizar stock para cada línea que tenga producto
      for (const line of invoice.lines) {
        if (!line.productId || !line.product) continue;

        // Solo actualizar stock si el producto tiene trackStock = true
        if (!line.product.trackStock) continue;

        const quantity = Number(line.quantity);

        // Incrementar stock en almacén principal
        await tx.warehouseStock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: mainWarehouse.id,
              productId: line.productId,
            },
          },
          create: {
            warehouseId: mainWarehouse.id,
            productId: line.productId,
            quantity,
            reservedQty: 0,
            availableQty: quantity,
          },
          update: {
            quantity: {
              increment: quantity,
            },
            availableQty: {
              increment: quantity,
            },
          },
        });

        // Registrar movimiento de stock
        await tx.stockMovement.create({
          data: {
            companyId,
            warehouseId: mainWarehouse.id,
            productId: line.productId,
            type: 'PURCHASE',
            quantity,
            referenceType: 'purchase_invoice',
            referenceId: invoice.id,
            notes: `Compra ${invoice.fullNumber} - ${line.product.name}`,
            date: invoice.issueDate,
            createdBy: userId,
          },
        });
      }

      // Crear asiento contable automáticamente
      try {
        const journalEntryId = await createJournalEntryForPurchaseInvoice(id, companyId, tx);

        if (journalEntryId) {
          // Actualizar factura con referencia al asiento contable
          await tx.purchaseInvoice.update({
            where: { id },
            data: { journalEntryId },
          });

          logger.info('Asiento contable generado para factura de compra', {
            data: { invoiceId: id, journalEntryId },
          });
        }
      } catch (error) {
        logger.warn('No se pudo generar asiento contable para factura de compra', {
          data: { invoiceId: id, error },
        });
        // No lanzar error para no interrumpir la confirmación de la factura
      }

      return updatedInvoice;
    });

    logger.info('Factura de compra confirmada y stock incrementado', {
      data: {
        invoiceId: id,
        fullNumber: invoice.fullNumber,
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/purchases');
    revalidatePath(`/dashboard/commercial/purchases/${id}`);
    revalidatePath('/dashboard/commercial/stock');
    return result;
  } catch (error) {
    logger.error('Error al confirmar factura de compra', {
      data: { error, id, companyId, userId },
    });
    throw error;
  }
}

/**
 * Cancela una factura de compra y revierte el stock si estaba confirmada
 */
export async function cancelPurchaseInvoice(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura de compra no encontrada');
    }

    if (invoice.companyId !== companyId) {
      throw new Error('No tienes permiso para cancelar esta factura');
    }

    if (invoice.status === 'CANCELLED') {
      throw new Error('La factura ya está cancelada');
    }

    if (invoice.status === 'PAID' || invoice.status === 'PARTIAL_PAID') {
      throw new Error('No se puede cancelar una factura pagada o parcialmente pagada');
    }

    // Obtener almacén principal
    const mainWarehouse = await prisma.warehouse.findFirst({
      where: {
        companyId,
        type: 'MAIN',
        isActive: true,
      },
    });

    // Cancelar factura y revertir stock si estaba confirmada
    const result = await prisma.$transaction(async (tx) => {
      // Si estaba confirmada, revertir stock
      if (invoice.status === 'CONFIRMED' && mainWarehouse) {
        for (const line of invoice.lines) {
          if (!line.productId || !line.product || !line.product.trackStock) {
            continue;
          }

          const quantity = Number(line.quantity);

          // Verificar que hay stock suficiente para revertir
          const currentStock = await tx.warehouseStock.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: mainWarehouse.id,
                productId: line.productId,
              },
            },
          });

          if (!currentStock || Number(currentStock.availableQty) < quantity) {
            throw new Error(
              `No hay stock suficiente del producto "${line.product.name}" para cancelar la factura. ` +
              `Se necesitan ${quantity} unidades disponibles.`
            );
          }

          // Decrementar stock
          await tx.warehouseStock.update({
            where: {
              warehouseId_productId: {
                warehouseId: mainWarehouse.id,
                productId: line.productId,
              },
            },
            data: {
              quantity: {
                decrement: quantity,
              },
              availableQty: {
                decrement: quantity,
              },
            },
          });

          // Registrar movimiento de reversión
          await tx.stockMovement.create({
            data: {
              companyId,
              warehouseId: mainWarehouse.id,
              productId: line.productId,
              type: 'ADJUSTMENT',
              quantity: -quantity,
              referenceType: 'purchase_invoice_cancel',
              referenceId: invoice.id,
              notes: `Cancelación de compra ${invoice.fullNumber} - ${line.product.name}`,
              date: new Date(),
              createdBy: userId,
            },
          });
        }
      }

      // Actualizar estado de la factura
      return await tx.purchaseInvoice.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          supplier: true,
          lines: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    logger.info('Factura de compra cancelada', {
      data: {
        invoiceId: id,
        fullNumber: invoice.fullNumber,
        wasConfirmed: invoice.status === 'CONFIRMED',
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/purchases');
    revalidatePath(`/dashboard/commercial/purchases/${id}`);
    revalidatePath('/dashboard/commercial/stock');
    return result;
  } catch (error) {
    logger.error('Error al cancelar factura de compra', {
      data: { error, id, companyId, userId },
    });
    throw error;
  }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type PurchaseInvoiceListItem = Awaited<
  ReturnType<typeof getPurchaseInvoicesPaginated>
>['data'][number];
export type PurchaseInvoiceDetail = Awaited<ReturnType<typeof getPurchaseInvoiceById>>;
export type SupplierSelectItem = Awaited<ReturnType<typeof getSuppliersForSelect>>[number];
export type ProductSelectItem = Awaited<ReturnType<typeof getProductsForSelect>>[number];
