import { EmployeeNewPage } from '@/modules/employees';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuevo Empleado',
};

export default function Page() {
  return <EmployeeNewPage />;
}
