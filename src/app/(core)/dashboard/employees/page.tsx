import { EmployeesList } from '@/modules/employees/features/list/EmployeesList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empleados',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <EmployeesList searchParams={params} />;
}
