import { EditSupplier } from '@/modules/commercial/features/suppliers';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSupplierPage({ params }: PageProps) {
  const { id } = await params;
  return <EditSupplier supplierId={id} />;
}
