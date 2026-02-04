'use client';

import { Building2 } from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

import type { CompanyListItem } from '@/modules/companies/actionsServer';

interface CompanyDisplayProps {
  company: CompanyListItem;
}

/**
 * Componente para mostrar la empresa en modo Single Company
 * No tiene dropdown ni opción de cambiar - solo muestra la empresa actual
 */
export function _CompanyDisplay({ company }: CompanyDisplayProps) {
  return (
    <SidebarMenu data-testid="company-display">
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{company.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {company.industry || 'Empresa'}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
