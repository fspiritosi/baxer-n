import { CompaniesPage } from '@/modules/companies';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empresas',
};

export default function Page() {
  return <CompaniesPage />;
}
