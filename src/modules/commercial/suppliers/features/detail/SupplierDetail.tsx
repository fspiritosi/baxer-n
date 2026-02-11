import { checkPermission } from '@/shared/lib/permissions';
import { getSupplierById } from '../list/actions.server';
import { _SupplierDetailContent } from './components/_SupplierDetailContent';
import { notFound } from 'next/navigation';

interface SupplierDetailProps {
  supplierId: string;
}

export async function SupplierDetail({ supplierId }: SupplierDetailProps) {
  await checkPermission('commercial.suppliers', 'view');

  const supplier = await getSupplierById(supplierId);

  if (!supplier) {
    notFound();
  }

  return <_SupplierDetailContent supplier={supplier} />;
}
