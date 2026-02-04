import { EquipmentEdit } from '@/modules/equipment';

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EquipmentEdit id={id} />;
}
