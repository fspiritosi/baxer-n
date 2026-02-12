import { SupplierDetail } from '@/modules/commercial/features/suppliers';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SupplierDetail supplierId={id} />;
}
