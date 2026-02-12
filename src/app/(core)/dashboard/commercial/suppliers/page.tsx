import type { Metadata } from 'next';
import { SuppliersList } from '@/modules/commercial/features/suppliers';

export const metadata: Metadata = {
  title: 'Proveedores',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
  }>;
}

export default async function SuppliersPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <SuppliersList searchParams={resolvedSearchParams} />;
}
