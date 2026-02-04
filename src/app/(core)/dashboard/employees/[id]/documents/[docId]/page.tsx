import type { Metadata } from 'next';

import { EmployeeDocumentDetail } from '@/modules/documents/features/employee-documents/detail';

export const metadata: Metadata = {
  title: 'Detalle de Documento',
};

interface Props {
  params: Promise<{
    id: string;
    docId: string;
  }>;
}

export default async function EmployeeDocumentDetailPage({ params }: Props) {
  const { id, docId } = await params;

  return <EmployeeDocumentDetail employeeId={id} documentId={docId} />;
}
