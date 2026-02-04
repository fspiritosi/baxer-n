import { EquipmentCreate } from '@/modules/equipment';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nuevo Equipo' };

export default function NewEquipmentPage() {
  return <EquipmentCreate />;
}
