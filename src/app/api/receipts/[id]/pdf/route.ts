/**
 * API Route para generar y servir PDF de recibo de cobro
 * GET /api/receipts/:id/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import {
  generateReceiptPDF,
  getReceiptFileName,
  mapReceiptDataForPDF,
} from '@/modules/commercial/features/treasury/features/receipts/shared/pdf';

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

    // Obtener recibo con todos los datos necesarios
    const receipt = await prisma.receipt.findFirst({
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
        customer: {
          select: {
            name: true,
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
                receiptItems: {
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

    if (!receipt) {
      return NextResponse.json({ error: 'Recibo no encontrado' }, { status: 404 });
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
    const pdfData = mapReceiptDataForPDF(receipt as any, company);

    // Generar PDF
    const pdfBuffer = await generateReceiptPDF(pdfData);

    // Generar nombre de archivo
    const fileName = getReceiptFileName(pdfData);

    // Log de generación
    logger.info('PDF de recibo generado', {
      data: {
        receiptId: receipt.id,
        fullNumber: receipt.fullNumber,
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
    const { id: receiptId } = await params;
    logger.error('Error generando PDF de recibo', {
      data: { receiptId, error },
    });

    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
  }
}
