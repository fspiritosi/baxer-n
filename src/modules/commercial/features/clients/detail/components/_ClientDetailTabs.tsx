'use client';

import { Building2, Truck, Users } from 'lucide-react';

import { UrlTabs, UrlTabsList, UrlTabsTrigger } from '@/shared/components/ui/url-tabs';

export type ClientDetailTab = 'general' | 'vehicles' | 'employees';

interface Props {
  clientId: string;
  currentTab: ClientDetailTab;
  children: React.ReactNode;
}

export function _ClientDetailTabs({ clientId, currentTab, children }: Props) {
  return (
    <UrlTabs
      value={currentTab}
      paramName="tab"
      baseUrl={`/dashboard/company/commercial/clients/${clientId}`}
      className="w-full"
    >
      <UrlTabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
        <UrlTabsTrigger
          value="general"
          className="flex items-center justify-center gap-2 py-2 sm:py-1.5"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Información General</span>
          <span className="sm:hidden text-xs">General</span>
        </UrlTabsTrigger>
        <UrlTabsTrigger
          value="vehicles"
          className="flex items-center justify-center gap-2 py-2 sm:py-1.5"
        >
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Vehículos</span>
          <span className="sm:hidden text-xs">Vehículos</span>
        </UrlTabsTrigger>
        <UrlTabsTrigger
          value="employees"
          className="flex items-center justify-center gap-2 py-2 sm:py-1.5"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Empleados</span>
          <span className="sm:hidden text-xs">Empleados</span>
        </UrlTabsTrigger>
      </UrlTabsList>

      {children}
    </UrlTabs>
  );
}
