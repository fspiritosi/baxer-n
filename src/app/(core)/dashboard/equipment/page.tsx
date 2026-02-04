import { EquipmentList } from '@/modules/equipment';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Equipos' };

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EquipmentPage({ searchParams }: Props) {
  const params = await searchParams;
  return <EquipmentList searchParams={params} />;
}
