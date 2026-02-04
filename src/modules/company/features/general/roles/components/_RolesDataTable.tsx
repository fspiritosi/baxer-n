'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  DataTable,
  type DataTableSearchParams,
} from '@/shared/components/common/DataTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import type { ModulePermissions } from '@/shared/lib/permissions';

import { getColumns } from '../columns';
import { _RoleFormModal } from './_RoleFormModal';
import {
  deleteRole,
  type RoleListItem,
  type SystemAction,
  type PermissionsConfig,
} from '../actions.server';

interface Props {
  data: RoleListItem[];
  totalRows: number;
  searchParams: DataTableSearchParams;
  systemActions: SystemAction[];
  permissionsConfig: PermissionsConfig;
  permissions: ModulePermissions;
}

export function _RolesDataTable({
  data,
  totalRows,
  searchParams,
  systemActions,
  permissionsConfig,
  permissions,
}: Props) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleListItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleListItem | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await deleteRole(deletingRole.id);
      toast.success('Rol eliminado');
      handleRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar rol');
    } finally {
      setDeletingRole(null);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: setEditingRole,
        onDelete: setDeletingRole,
        permissions,
      }),
    [permissions]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        totalRows={totalRows}
        searchParams={searchParams}
        searchPlaceholder="Buscar roles..."
        toolbarActions={
          permissions.canCreate ? (
            <Button onClick={() => setIsCreateOpen(true)} data-testid="new-role-button">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          ) : null
        }
      />

      {/* Modal de crear/editar rol */}
      <_RoleFormModal
        open={isCreateOpen || !!editingRole}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingRole(null);
          }
        }}
        role={editingRole}
        systemActions={systemActions}
        permissionsConfig={permissionsConfig}
        onSuccess={handleRefresh}
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este rol?</AlertDialogTitle>
            <AlertDialogDescription>
              El rol &quot;{deletingRole?.name}&quot; será eliminado permanentemente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
