import { EmployeeEditPage } from '@/modules/employees';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Empleado',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EmployeeEditPage id={id} />;
}
