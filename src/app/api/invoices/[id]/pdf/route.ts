/**
 * API Route para generar y servir PDF de factura
 * GET /api/invoices/:id/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { generateInvoicePDF, getInvoiceFileName } from '@/modules/commercial/features/sales/shared/pdf/generator';
import { mapInvoiceDataForPDF } from '@/modules/commercial/features/sales/shared/pdf/data-mapper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Obtener factura con todos los datos necesarios
    const invoice = await prisma.salesInvoice.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        customer: {
          select: {
            name: true,
            taxId: true,
            taxCondition: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        pointOfSale: {
          select: {
            number: true,
            name: true,
          },
        },
        lines: {
          include: {
            product: {
              select: {
                code: true,
                name: true,
                unitOfMeasure: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Obtener datos de la empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        taxId: true,
        taxStatus: true,
        address: true,
        phone: true,
        email: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Mapear datos al formato del PDF
    const pdfData = mapInvoiceDataForPDF(invoice as any, company);

    // Generar PDF
    const pdfBuffer = await generateInvoicePDF(pdfData);

    // Generar nombre de archivo
    const fileName = getInvoiceFileName(pdfData);

    // Log de generación
    logger.info('PDF de factura generado', {
      data: {
        invoiceId: invoice.id,
        fullNumber: invoice.fullNumber,
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
    const { id: invoiceId } = await params;
    logger.error('Error generando PDF de factura', {
      data: { invoiceId, error },
    });

    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
