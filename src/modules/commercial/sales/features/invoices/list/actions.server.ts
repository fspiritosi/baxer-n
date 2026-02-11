'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';
import { createInvoiceSchema } from '../shared/validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import {
  validateVoucherType,
  mapTaxStatusToCustomerTaxCondition,
} from '../shared/afip-validation';

// Obtener todas las facturas de venta
export async function getInvoices() {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');
  const userId = authUserId;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoices = await prisma.salesInvoice.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: [{ issueDate: 'desc' }, { number: 'desc' }],
      select: {
        id: true,
        voucherType: true,
        number: true,
        fullNumber: true,
        issueDate: true,
        dueDate: true,
        subtotal: true,
        vatAmount: true,
        total: true,
        status: true,
        customer: {
          select: {
            id: true,
            name: true,
            taxId: true,
          },
        },
        pointOfSale: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
        cae: true,
        caeExpiryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return invoices;
  } catch (error) {
    logger.error('Error al obtener facturas', {
      data: { companyId, error },
    });
    throw new Error('Error al obtener las facturas');
  }
}

// Obtener una factura por ID
export async function getInvoiceById(id: string) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');
  const userId = authUserId;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const invoice = await prisma.salesInvoice.findFirst({
      where: {
        id: id,
        companyId: companyId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            taxId: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        pointOfSale: {
          select: {
            id: true,
            number: true,
            name: true,
            afipEnabled: true,
          },
        },
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
        journalEntry: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    return invoice;
  } catch (error) {
    logger.error('Error al obtener factura', {
      data: { id, companyId, error },
    });
    throw new Error('Error al obtener la factura');
  }
}

// Obtener próximo número de factura
export async function getNextInvoiceNumber(
  pointOfSaleId: string,
  voucherType: string
): Promise<number> {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener el último número usado para este punto de venta y tipo de comprobante
    const lastInvoice = await prisma.salesInvoice.findFirst({
      where: {
        companyId: companyId,
        pointOfSaleId: pointOfSaleId,
        voucherType: voucherType as any,
      },
      orderBy: {
        number: 'desc',
      },
      select: {
        number: true,
      },
    });

    return lastInvoice ? lastInvoice.number + 1 : 1;
  } catch (error) {
    logger.error('Error al obtener próximo número de factura', {
      data: { pointOfSaleId, voucherType, companyId, error },
    });
    throw new Error('Error al obtener el próximo número');
  }
}

// Calcular totales de una línea
function calculateLineAmounts(
  quantity: number,
  unitPrice: number,
  vatRate: number
): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const subtotal = quantity * unitPrice;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Crear una nueva factura
export async function createInvoice(data: unknown) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');
  const userId = authUserId;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Validar datos
    const validatedData = createInvoiceSchema.parse(data);

    // Verificar que el punto de venta existe y pertenece a la empresa
    const pointOfSale = await prisma.salesPointOfSale.findFirst({
      where: {
        id: validatedData.pointOfSaleId,
        companyId: companyId,
        isActive: true,
      },
    });

    if (!pointOfSale) {
      throw new Error('Punto de venta no encontrado o inactivo');
    }

    // Verificar que el cliente existe
    const customer = await prisma.contractor.findFirst({
      where: {
        id: validatedData.customerId,
        companyId: companyId,
      },
      select: {
        id: true,
        name: true,
        taxCondition: true,
      },
    });

    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener condición fiscal de la empresa (emisor)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { taxStatus: true },
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // Validar tipo de comprobante según AFIP
    const emisorTaxCondition = mapTaxStatusToCustomerTaxCondition(company.taxStatus);
    const receptorTaxCondition = customer.taxCondition;

    const afipValidation = validateVoucherType(
      emisorTaxCondition,
      receptorTaxCondition,
      validatedData.voucherType as any
    );

    if (!afipValidation.isValid) {
      throw new Error(afipValidation.error);
    }

    // Obtener próximo número
    const nextNumber = await getNextInvoiceNumber(
      validatedData.pointOfSaleId,
      validatedData.voucherType
    );

    // Generar número completo (formato: 0001-00000001)
    const fullNumber = `${pointOfSale.number.toString().padStart(4, '0')}-${nextNumber.toString().padStart(8, '0')}`;

    // Calcular totales
    let invoiceSubtotal = 0;
    let invoiceVatAmount = 0;

    const linesData = validatedData.lines.map((line) => {
      const amounts = calculateLineAmounts(line.quantity, line.unitPrice, line.vatRate);

      invoiceSubtotal += amounts.subtotal;
      invoiceVatAmount += amounts.vatAmount;

      return {
        productId: line.productId,
        description: line.description,
        quantity: new Prisma.Decimal(line.quantity),
        unitPrice: new Prisma.Decimal(line.unitPrice),
        vatRate: new Prisma.Decimal(line.vatRate),
        vatAmount: new Prisma.Decimal(amounts.vatAmount),
        subtotal: new Prisma.Decimal(amounts.subtotal),
        total: new Prisma.Decimal(amounts.total),
      };
    });

    const invoiceTotal = invoiceSubtotal + invoiceVatAmount;

    // Crear factura en transacción
    const invoice = await prisma.$transaction(async (tx) => {
      // Crear factura
      const newInvoice = await tx.salesInvoice.create({
        data: {
          companyId: companyId,
          customerId: validatedData.customerId,
          pointOfSaleId: validatedData.pointOfSaleId,
          voucherType: validatedData.voucherType as any,
          number: nextNumber,
          fullNumber: fullNumber,
          issueDate: validatedData.issueDate,
          dueDate: validatedData.dueDate,
          subtotal: new Prisma.Decimal(invoiceSubtotal),
          vatAmount: new Prisma.Decimal(invoiceVatAmount),
          otherTaxes: new Prisma.Decimal(0),
          total: new Prisma.Decimal(invoiceTotal),
          notes: validatedData.notes,
          internalNotes: validatedData.internalNotes,
          status: 'DRAFT',
          createdBy: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: true,
          customer: true,
          pointOfSale: true,
        },
      });

      return newInvoice;
    });

    logger.info('Factura creada', {
      data: {
        invoiceId: invoice.id,
        fullNumber: invoice.fullNumber,
        total: invoice.total.toString(),
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/invoices');
    return invoice;
  } catch (error) {
    logger.error('Error al crear factura', {
      data: { companyId, error },
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error al crear la factura');
  }
}

// Confirmar factura (cambia estado de DRAFT a CONFIRMED y descuenta stock)
export async function confirmInvoice(id: string) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');
  const userId = authUserId;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que la factura existe y está en borrador
    const invoice = await prisma.salesInvoice.findFirst({
      where: {
        id: id,
        companyId: companyId,
        status: 'DRAFT',
      },
      include: {
        lines: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                trackStock: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura no encontrada o ya está confirmada');
    }

    // Confirmar y descontar stock en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar factura
      const updatedInvoice = await tx.salesInvoice.update({
        where: { id: id },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Descontar stock de productos
      for (const line of invoice.lines) {
        if (line.product.trackStock) {
          // Buscar almacén principal (o el primero disponible)
          const warehouse = await tx.warehouse.findFirst({
            where: {
              companyId: companyId,
              isActive: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          });

          if (!warehouse) {
            throw new Error('No hay almacenes disponibles para descontar stock');
          }

          // Obtener stock actual
          const warehouseStock = await tx.warehouseStock.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: line.productId,
              },
            },
          });

          const currentStock = warehouseStock?.quantity || new Prisma.Decimal(0);
          const quantityToDeduct = line.quantity;

          if (currentStock.lessThan(quantityToDeduct)) {
            throw new Error(
              `Stock insuficiente para ${line.product.name}. Disponible: ${currentStock}, Requerido: ${quantityToDeduct}`
            );
          }

          // Actualizar o crear stock
          await tx.warehouseStock.upsert({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: line.productId,
              },
            },
            update: {
              quantity: {
                decrement: quantityToDeduct,
              },
            },
            create: {
              warehouseId: warehouse.id,
              productId: line.productId,
              quantity: new Prisma.Decimal(0).minus(quantityToDeduct),
            },
          });

          // Registrar movimiento de stock
          await tx.stockMovement.create({
            data: {
              companyId: companyId,
              productId: line.productId,
              warehouseId: warehouse.id,
              type: 'SALE',
              quantity: quantityToDeduct,
              referenceType: 'sales_invoice',
              referenceId: invoice.id,
              notes: `Factura ${invoice.fullNumber}`,
              date: new Date(),
              createdBy: userId,
            },
          });
        }
      }

      return updatedInvoice;
    });

    logger.info('Factura confirmada y stock descontado', {
      data: {
        invoiceId: id,
        fullNumber: invoice.fullNumber,
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/invoices');
    revalidatePath(`/dashboard/commercial/invoices/${id}`);
    revalidatePath('/dashboard/commercial/stock');
    return result;
  } catch (error) {
    logger.error('Error al confirmar factura', {
      data: { id, companyId, error },
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error al confirmar la factura');
  }
}

// Obtener tipos de comprobante permitidos según cliente seleccionado
export async function getAllowedVoucherTypesForCustomer(customerId: string) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Obtener condición fiscal del cliente
    const customer = await prisma.contractor.findFirst({
      where: {
        id: customerId,
        companyId: companyId,
      },
      select: {
        taxCondition: true,
      },
    });

    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener condición fiscal de la empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { taxStatus: true },
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // Mapear y obtener tipos permitidos
    const emisorTaxCondition = mapTaxStatusToCustomerTaxCondition(company.taxStatus);
    const receptorTaxCondition = customer.taxCondition;

    const { getAllowedVoucherTypes } = await import('../shared/afip-validation');
    const allowedTypes = getAllowedVoucherTypes(emisorTaxCondition, receptorTaxCondition);

    return allowedTypes;
  } catch (error) {
    logger.error('Error al obtener tipos de comprobante permitidos', {
      data: { customerId, companyId, error },
    });
    throw error;
  }
}

// Anular factura
export async function cancelInvoice(id: string) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error('No autenticado');
  const userId = authUserId;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que la factura existe y no está ya anulada
    const invoice = await prisma.salesInvoice.findFirst({
      where: {
        id: id,
        companyId: companyId,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura no encontrada o ya está anulada');
    }

    // Anular factura
    const result = await prisma.salesInvoice.update({
      where: { id: id },
      data: {
        status: 'CANCELLED',
      },
    });

    logger.info('Factura anulada', {
      data: {
        invoiceId: id,
        fullNumber: invoice.fullNumber,
        companyId,
        userId,
      },
    });

    revalidatePath('/dashboard/commercial/invoices');
    revalidatePath(`/dashboard/commercial/invoices/${id}`);
    return result;
  } catch (error) {
    logger.error('Error al anular factura', {
      data: { id, companyId, error },
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error al anular la factura');
  }
}
