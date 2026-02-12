import type { Metadata } from 'next';
import { ProductsList } from '@/modules/commercial/features/products/features/list';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Gestión de productos y servicios',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <ProductsList searchParams={resolvedSearchParams} />;
}
