import { getActiveCompany } from '@/shared/lib/company';
// import { getMyCompanies } from '@/modules/companies/actionsServer';
import { NoCompanyFallback } from '@/modules/companies';
import { getMyCompanies } from '@/modules/companies/features/list';
import { getSidebarPermissions } from '@/shared/actions/sidebar';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

/**
 * Layout del Dashboard
 *
 * Server Component - Verifica company activa y renderiza layout o fallback
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const activeCompany = await getActiveCompany();

  // Si no tiene company, mostrar fallback para crear una
  if (!activeCompany) {
    return <NoCompanyFallback />;
  }

  // Obtener companies y permisos del sidebar en paralelo
  const [companies, sidebarPermissions] = await Promise.all([
    getMyCompanies(),
    getSidebarPermissions(),
  ]);

  return (
    <DashboardLayout
      companies={companies}
      activeCompany={activeCompany}
      isSingleMode={activeCompany.isSingleMode}
      sidebarPermissions={sidebarPermissions}
    >
      {children}
    </DashboardLayout>
  );
}
