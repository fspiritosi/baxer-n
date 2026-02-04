'use client';

import { useSearchParams } from 'next/navigation';

import { _UniversalUploadModal } from './_UniversalUploadModal';

interface Props {
  companyId: string;
}

/**
 * Header con botón de upload para documentos.
 * Client Component porque necesita leer el tab actual de la URL.
 */
export function _DocumentsHeader({ companyId }: Props) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'employees';

  // No mostrar en tab de tipos
  if (currentTab === 'types') {
    return null;
  }

  return (
    <_UniversalUploadModal
      currentTab={currentTab as 'employees' | 'equipment' | 'company'}
      companyId={companyId}
    />
  );
}
