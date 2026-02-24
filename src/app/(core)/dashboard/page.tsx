import type { Metadata } from 'next';
import { DashboardContent } from '@/modules/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel principal',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  return <DashboardContent period={params.month} />;
}
