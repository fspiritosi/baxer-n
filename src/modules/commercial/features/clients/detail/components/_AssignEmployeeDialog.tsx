'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';

import {
  assignEmployeeToClient,
  getAvailableEmployeesForClient,
  type AvailableEmployee,
} from '../actions.server';

interface Props {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function _AssignEmployeeDialog({ clientId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [employees, setEmployees] = useState<AvailableEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingEmployees(true);
      getAvailableEmployeesForClient(clientId)
        .then(setEmployees)
        .finally(() => setIsLoadingEmployees(false));
    } else {
      setSelectedEmployeeId('');
      setEmployees([]);
    }
  }, [open, clientId]);

  const handleAssign = async () => {
    if (!selectedEmployeeId) return;

    setIsLoading(true);
    try {
      await assignEmployeeToClient(clientId, selectedEmployeeId);
      toast.success('Empleado asignado correctamente');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al asignar empleado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignar Empleado
          </DialogTitle>
          <DialogDescription>
            Selecciona un empleado para asignarlo a este cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="employee">Empleado</Label>
          <Select
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
            disabled={isLoadingEmployees}
          >
            <SelectTrigger id="employee" className="mt-2">
              <SelectValue
                placeholder={isLoadingEmployees ? 'Cargando...' : 'Seleccionar empleado'}
              />
            </SelectTrigger>
            <SelectContent>
              {employees.length === 0 && !isLoadingEmployees ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No hay empleados disponibles para asignar
                </div>
              ) : (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{employee.employeeNumber}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>
                        {employee.lastName}, {employee.firstName}
                      </span>
                      {employee.jobPosition && (
                        <span className="text-muted-foreground">({employee.jobPosition.name})</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedEmployeeId || isLoading || isLoadingEmployees}
          >
            {isLoading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
