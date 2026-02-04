'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';

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
  assignVehicleToClient,
  getAvailableVehiclesForClient,
  type AvailableVehicle,
} from '../actions.server';

interface Props {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function _AssignVehicleDialog({ clientId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<AvailableVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingVehicles(true);
      getAvailableVehiclesForClient(clientId)
        .then(setVehicles)
        .finally(() => setIsLoadingVehicles(false));
    } else {
      setSelectedVehicleId('');
      setVehicles([]);
    }
  }, [open, clientId]);

  const handleAssign = async () => {
    if (!selectedVehicleId) return;

    setIsLoading(true);
    try {
      await assignVehicleToClient(clientId, selectedVehicleId);
      toast.success('Vehículo asignado correctamente');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al asignar vehículo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Asignar Vehículo
          </DialogTitle>
          <DialogDescription>
            Selecciona un vehículo para asignarlo a este cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="vehicle">Vehículo</Label>
          <Select
            value={selectedVehicleId}
            onValueChange={setSelectedVehicleId}
            disabled={isLoadingVehicles}
          >
            <SelectTrigger id="vehicle" className="mt-2">
              <SelectValue
                placeholder={isLoadingVehicles ? 'Cargando...' : 'Seleccionar vehículo'}
              />
            </SelectTrigger>
            <SelectContent>
              {vehicles.length === 0 && !isLoadingVehicles ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No hay vehículos disponibles para asignar
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vehicle.internNumber}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{vehicle.domain}</span>
                      {vehicle.brand && (
                        <span className="text-muted-foreground">
                          ({vehicle.brand.name} {vehicle.model?.name})
                        </span>
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
            disabled={!selectedVehicleId || isLoading || isLoadingVehicles}
          >
            {isLoading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
