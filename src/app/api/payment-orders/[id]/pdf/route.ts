/**
 * API Route para generar y servir PDF de orden de pago
 * GET /api/payment-orders/:id/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import {
  generatePaymentOrderPDF,
  getPaymentOrderFileName,
  mapPaymentOrderDataForPDF,
} from '@/modules/commercial/features/treasury/features/payment-orders/shared/pdf';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const companyId = await getActiveCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: 'No hay empresa activa' }, { status: 400 });
    }

    // Obtener orden de pago con todos los datos necesarios
    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
        number: true,
        fullNumber: true,
        date: true,
        totalAmount: true,
        notes: true,
        status: true,
        supplier: {
          select: {
            businessName: true,
            tradeName: true,
            taxId: true,
            address: true,
            phone: true,
            email: true,
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
                issueDate: true,
                total: true,
                paymentOrderItems: {
                  select: {
                    amount: true,
                  },
                },
              },
            },
          },
          orderBy: {
            id: 'asc',
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
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!paymentOrder) {
      return NextResponse.json({ error: 'Orden de pago no encontrada' }, { status: 404 });
    }

    // Obtener datos de la empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        taxId: true,
        address: true,
        phone: true,
        email: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Mapear datos al formato del PDF
    const pdfData = mapPaymentOrderDataForPDF(paymentOrder as any, company);

    // Generar PDF
    const pdfBuffer = await generatePaymentOrderPDF(pdfData);

    // Generar nombre de archivo
    const fileName = getPaymentOrderFileName(pdfData);

    // Log de generación
    logger.info('PDF de orden de pago generado', {
      data: {
        paymentOrderId: paymentOrder.id,
        fullNumber: paymentOrder.fullNumber,
        companyId,
        userId,
      },
    });

    // Retornar PDF (convertir Buffer a Uint8Array)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const { id: paymentOrderId } = await params;
    logger.error('Error generando PDF de orden de pago', {
      data: { paymentOrderId, error },
    });

    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
  }
}
