import { NextResponse } from 'next/server';
import { getActiveCompanyId } from '@/shared/lib/company';

export async function GET() {
  try {
    const companyId = await getActiveCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: 'No hay empresa activa' },
        { status: 404 }
      );
    }

    return NextResponse.json({ companyId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la empresa activa' },
      { status: 500 }
    );
  }
}
