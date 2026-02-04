import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPublicVehicleById } from './actions.server';
import { _PublicEquipmentView } from './components/_PublicEquipmentView';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getPublicVehicleById(id);

  if (!vehicle) {
    return {
      title: 'Equipo no encontrado',
    };
  }

  const identifier = vehicle.internNumber || vehicle.domain || 'Equipo';

  return {
    title: `${identifier} - ${vehicle.company.name}`,
    description: `Información del equipo ${identifier}`,
  };
}

export default async function PublicEquipmentPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getPublicVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return <_PublicEquipmentView vehicle={vehicle} />;
}
