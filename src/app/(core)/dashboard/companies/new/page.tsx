import { CompanyNewPage } from '@/modules/companies';
import { Metadata } from 'next';

export const metadata: Metadata  = {
  title: 'Nueva Empresa',
};

export default function Page() {
  return <CompanyNewPage />;
}
