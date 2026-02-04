import { Metadata } from 'next';

import { EmployeeDetailPage } from '@/modules/employees';

export const metadata: Metadata = {
  title: 'Detalle de Empleado',
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  return <EmployeeDetailPage id={id} searchParams={resolvedSearchParams} />;
}
