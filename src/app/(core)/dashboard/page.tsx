import type { Metadata } from 'next';
import { DashboardContent } from '@/modules/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel principal',
};

/**
 * Página del Dashboard
 *
 * Server Component - La lógica principal está en features/Dashboard
 * Esta página es "delgada" siguiendo la arquitectura del proyecto
 */
export default function DashboardPage() {
  return <DashboardContent />;
}
