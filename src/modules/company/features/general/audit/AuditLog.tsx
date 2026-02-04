import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import { getAuditLogsPaginated } from './actions.server';
import { _AuditLogTable } from './components/_AuditLogTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function AuditLog({ searchParams }: Props) {
  const result = await getAuditLogsPaginated(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
        <p className="text-muted-foreground">
          Historial de cambios en permisos y roles de la empresa
        </p>
      </div>

      <_AuditLogTable
        data={result.data}
        totalRows={result.total}
        searchParams={searchParams}
      />
    </div>
  );
}
