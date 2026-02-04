'use client';

import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';

import type { CompanyListItem } from '@/modules/companies/actionsServer';
import { setActiveCompany } from '@/shared/lib/company';

interface CompanySelectorProps {
  companies: CompanyListItem[];
  activeCompany: CompanyListItem;
}

export function _CompanySelector({ companies, activeCompany }: CompanySelectorProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();

  const handleCompanyChange = (companyId: string) => {
    if (companyId === activeCompany.id) return;

    startTransition(async () => {
      try {
        await setActiveCompany(companyId);
        router.refresh();
        toast.success('Empresa cambiada');
      } catch (error) {
        toast.error('Error al cambiar de empresa');
      }
    });
  };

  return (
    <SidebarMenu data-testid="company-selector">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isPending}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {activeCompany.logoUrl ? (
                  <img
                    src={activeCompany.logoUrl}
                    alt={activeCompany.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeCompany.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeCompany.industry || 'Empresa'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Mis Empresas
            </DropdownMenuLabel>
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleCompanyChange(company.id)}
                className="cursor-pointer gap-2 p-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm border bg-background">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-full w-full rounded-sm object-cover"
                    />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                </div>
                <span className="flex-1 truncate">{company.name}</span>
                {company.id === activeCompany.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 p-2"
              onClick={() => router.push('/dashboard/companies/new')}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed bg-background">
                <Plus className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground">Crear nueva empresa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
