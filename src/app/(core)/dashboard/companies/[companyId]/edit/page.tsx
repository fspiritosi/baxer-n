import { CompanyEditPage } from '@/modules/companies';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar empresa',
};

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const companyId = (await params).companyId;
  return <CompanyEditPage companyId={companyId} />;
}
