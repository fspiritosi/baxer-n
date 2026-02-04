'use client';

import type { CompanyListItem } from '@/modules/companies/actionsServer';
import type { SidebarPermissions } from '@/shared/actions/sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { _AppSidebar } from './_AppSidebar';
import { _SiteHeader } from './_SiteHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  companies: CompanyListItem[];
  activeCompany: CompanyListItem;
  isSingleMode?: boolean;
  sidebarPermissions: SidebarPermissions;
}

/**
 * Layout del Dashboard con Sidebar colapsable
 *
 * Usa el patrón SidebarProvider de shadcn/ui
 */
export function DashboardLayout({
  children,
  companies,
  activeCompany,
  isSingleMode = false,
  sidebarPermissions,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <_AppSidebar
        companies={companies}
        activeCompany={activeCompany}
        isSingleMode={isSingleMode}
        permissions={sidebarPermissions}
      />
      <SidebarInset>
        <_SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
