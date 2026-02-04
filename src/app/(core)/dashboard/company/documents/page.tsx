import type { Metadata } from 'next';

import { CompanyDocumentsList } from '@/modules/documents';

export const metadata: Metadata = {
  title: 'Documentos de Empresa',
};

export default function CompanyDocumentsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Documentos de Empresa</h1>
        <p className="text-muted-foreground">
          Gestiona los documentos corporativos de tu empresa
        </p>
      </div>
      <CompanyDocumentsList />
    </div>
  );
}
