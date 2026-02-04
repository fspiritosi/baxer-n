import { CompanyDetailPage } from '@/modules/companies';
import { Metadata } from 'next';
import { logger } from '@/shared/lib/logger';

export const metadata: Metadata = {
  title: 'Detalle de empresa',
};

interface PageProps {
  params: {
    companyId: string;
  };
}

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  // Asegurarnos de que companyId sea string
  const companyId = (await params).companyId;
console.log(companyId, 'companyId que llega');
  logger.info('Company detail page params:', { data: { companyId, type: typeof companyId } });
  
  if (!companyId || typeof companyId !== 'string') {
    throw new Error('Company ID is required and must be a string');
  }

  // Validar que el ID tenga un formato válido
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId)) {
    throw new Error('Invalid company ID format');
  }


  return <CompanyDetailPage companyId={companyId} />;
}
