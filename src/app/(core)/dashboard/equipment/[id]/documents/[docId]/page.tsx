import type { Metadata } from 'next';

import { EquipmentDocumentDetail } from '@/modules/documents/features/equipment-documents/detail';

export const metadata: Metadata = {
  title: 'Detalle de Documento',
};

interface Props {
  params: Promise<{
    id: string;
    docId: string;
  }>;
}

export default async function EquipmentDocumentDetailPage({ params }: Props) {
  const { id, docId } = await params;

  return <EquipmentDocumentDetail equipmentId={id} documentId={docId} />;
}
