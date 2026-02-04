import { Building2, Calendar, Car, Hash, Tag, Truck, Wrench } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { PublicVehicle } from '../actions.server';

interface Props {
  vehicle: NonNullable<PublicVehicle>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export function _PublicEquipmentView({ vehicle }: Props) {
  const identifier = vehicle.internNumber || vehicle.domain || 'Equipo';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Company Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {vehicle.company.logoUrl ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
              <Image
                src={vehicle.company.logoUrl}
                alt={vehicle.company.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-lg">{vehicle.company.name}</h2>
            <p className="text-sm text-muted-foreground">Sistema de Gestión de Flota</p>
          </div>
        </div>

        {/* Equipment Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{identifier}</CardTitle>
            <CardDescription>
              Información del equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 divide-y">
            <InfoRow icon={Hash} label="N° Interno" value={vehicle.internNumber} />
            <InfoRow icon={Car} label="Dominio/Patente" value={vehicle.domain} />
            <InfoRow icon={Tag} label="Marca" value={vehicle.brand?.name} />
            <InfoRow icon={Tag} label="Modelo" value={vehicle.model?.name} />
            <InfoRow icon={Truck} label="Tipo" value={vehicle.type?.name} />
            <InfoRow icon={Tag} label="Clasificación" value={vehicle.typeOfVehicle?.name} />
            <InfoRow icon={Calendar} label="Año" value={vehicle.year} />
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Próximamente</Badge>
                <h3 className="font-semibold">Solicitudes de Mantenimiento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pronto podrás reportar problemas y solicitar mantenimiento escaneando este código QR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Información proporcionada por {vehicle.company.name}
        </p>
      </div>
    </div>
  );
}
