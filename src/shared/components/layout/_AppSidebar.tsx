'use client';

import {
  Briefcase,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import type { CompanyListItem } from '@/modules/companies/actionsServer';
import type { SidebarPermissions } from '@/shared/actions/sidebar';
import type { Module } from '@/shared/lib/permissions';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar';
import { _CompanyDisplay } from './_CompanyDisplay';
import { _CompanySelector } from './_CompanySelector';
import { _NavUser } from './nav/_NavUser';

// Tipos para navegación
interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  module?: Module | null; // null = siempre visible, sin módulo = siempre visible
}

interface NavSubGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

interface NavItemWithSub {
  title: string;
  href?: string;
  icon: LucideIcon;
  items?: NavItem[];
  subGroups?: NavSubGroup[];
}

// Navegación principal (sin subitems)
const navMain: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: null },
  { title: 'Empleados', href: '/dashboard/employees', icon: Users, module: 'employees' },
  { title: 'Equipos', href: '/dashboard/equipment', icon: Truck, module: 'equipment' },
  { title: 'Documentos', href: '/dashboard/documents', icon: FileText, module: 'documents' },
  { title: 'Operaciones', href: '/dashboard/operations', icon: ClipboardList, disabled: true, module: null },
  { title: 'Mantenimiento', href: '/dashboard/maintenance', icon: Wrench, disabled: true, module: null },
];

// Configuración con subitems colapsables y subgrupos
const getNavConfig = (isSingleMode: boolean, activeCompanyId?: string): NavItemWithSub[] => [
  {
    title: 'Empresa',
    icon: Building2,
    subGroups: [
      {
        title: 'Administración',
        icon: Shield,
        items: [
          { title: 'Usuarios', href: '/dashboard/company/general/users', module: 'company.general.users' },
          { title: 'Roles', href: '/dashboard/company/general/roles', module: 'company.general.roles' },
          { title: 'Auditoría', href: '/dashboard/company/general/audit', module: 'company.general.audit' },
        ],
      },
      {
        title: 'General',
        icon: Building2,
        items: [
          {
            title: isSingleMode ? 'Empresa' : 'Empresas',
            href: isSingleMode && activeCompanyId
              ? `/dashboard/companies/${activeCompanyId}`
              : '/dashboard/companies',
            module: null, // Siempre visible - el usuario necesita ver su empresa
          },
          { title: 'Centros de Costo', href: '/dashboard/company/cost-centers', module: 'company.cost-centers' },
          { title: 'Documentos', href: '/dashboard/company/documents', module: 'company.documents' },
        ],
      },
      {
        title: 'RRHH',
        icon: Users,
        items: [
          { title: 'Tipos de Contrato', href: '/dashboard/company/contract-types', module: 'company.contract-types' },
          { title: 'Puestos de Trabajo', href: '/dashboard/company/job-positions', module: 'company.job-positions' },
          { title: 'Sindicatos', href: '/dashboard/company/unions', module: 'company.unions' },
          { title: 'Convenios', href: '/dashboard/company/collective-agreements', module: 'company.collective-agreements' },
          { title: 'Categorías', href: '/dashboard/company/job-categories', module: 'company.job-categories' },
        ],
      },
      {
        title: 'Equipos',
        icon: Truck,
        items: [
          { title: 'Marcas', href: '/dashboard/company/vehicle-brands', module: 'company.vehicle-brands' },
          { title: 'Tipos de Equipo', href: '/dashboard/company/vehicle-types', module: 'company.vehicle-types' },
          { title: 'Titulares', href: '/dashboard/company/equipment-owners', module: 'company.equipment-owners' },
          { title: 'Sectores', href: '/dashboard/company/sectors', module: 'company.sectors' },
          { title: 'Tipos Operativos', href: '/dashboard/company/type-operatives', module: 'company.type-operatives' },
          { title: 'Contratistas', href: '/dashboard/company/contractors', module: 'company.contractors' },
        ],
      },
      {
        title: 'Comercial',
        icon: Briefcase,
        items: [
          { title: 'Clientes', href: '/dashboard/company/commercial/clients', module: 'commercial.clients' },
          { title: 'Leads', href: '/dashboard/company/commercial/leads', module: 'commercial.leads' },
          { title: 'Contactos', href: '/dashboard/company/commercial/contacts', module: 'commercial.contacts' },
          { title: 'Presupuestos', href: '/dashboard/company/commercial/quotes', disabled: true, module: 'commercial.quotes' },
        ],
      },
    ],
  },
  {
    title: 'Sistema',
    icon: Settings,
    items: [{ title: 'Configuración', href: '/dashboard/settings', disabled: true, module: null }],
  },
];

// Navegación secundaria
const navSecondary: NavItem[] = [
  { title: 'Ayuda', href: '/dashboard/help', icon: HelpCircle, disabled: true },
  { title: 'Buscar', href: '/dashboard/search', icon: Search, disabled: true },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  companies: CompanyListItem[];
  activeCompany: CompanyListItem;
  isSingleMode?: boolean;
  permissions: SidebarPermissions;
}

export function _AppSidebar({
  companies,
  activeCompany,
  isSingleMode = false,
  permissions,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const navConfig = getNavConfig(isSingleMode, activeCompany.id);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Determinar si algún subitem de un collapsible está activo
  const hasActiveSubItem = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href));
  };

  // Determinar si algún item de los subgrupos está activo
  const hasActiveInSubGroups = (subGroups: NavSubGroup[]) => {
    return subGroups.some((group) => hasActiveSubItem(group.items));
  };

  // Determinar si un subgrupo tiene algún item activo
  const hasActiveInSubGroup = (subGroup: NavSubGroup) => {
    return hasActiveSubItem(subGroup.items);
  };

  // ========================================
  // Funciones de filtrado por permisos
  // ========================================

  // Verificar si puede ver un item
  const canViewItem = (item: NavItem): boolean => {
    // Items sin módulo (null o undefined) son siempre visibles
    if (item.module === null || item.module === undefined) return true;
    // Verificar permiso en el mapa
    return permissions[item.module] === true;
  };

  // Filtrar items que el usuario puede ver
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(canViewItem);
  };

  // Filtrar subgrupos - solo mostrar si tiene al menos un item visible
  const filterSubGroups = (subGroups: NavSubGroup[]): NavSubGroup[] => {
    return subGroups
      .map((group) => ({
        ...group,
        items: filterItems(group.items),
      }))
      .filter((group) => group.items.length > 0);
  };

  // Filtrar config - solo mostrar si tiene al menos un item/subgrupo visible
  const filterNavConfig = (config: NavItemWithSub[]): NavItemWithSub[] => {
    return config
      .map((item) => ({
        ...item,
        items: item.items ? filterItems(item.items) : undefined,
        subGroups: item.subGroups ? filterSubGroups(item.subGroups) : undefined,
      }))
      .filter(
        (item) => (item.items?.length ?? 0) > 0 || (item.subGroups?.length ?? 0) > 0
      );
  };

  // Aplicar filtros
  const filteredNavMain = filterItems(navMain);
  const filteredNavConfig = filterNavConfig(navConfig);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isSingleMode ? (
          <_CompanyDisplay company={activeCompany} />
        ) : (
          <_CompanySelector companies={companies} activeCompany={activeCompany} />
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation - Solo mostrar si hay items */}
        {filteredNavMain.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavMain.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {item.disabled ? (
                      <SidebarMenuButton
                        tooltip={`${item.title} (Próximamente)`}
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.href)}>
                        <Link href={item.href}>
                          {item.icon && <item.icon className="size-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Configuration with Collapsible Items and SubGroups - Solo mostrar si hay items */}
        {filteredNavConfig.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Configuración</SidebarGroupLabel>
            <SidebarMenu>
              {filteredNavConfig.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={
                  (item.items && hasActiveSubItem(item.items)) ||
                  (item.subGroups && hasActiveInSubGroups(item.subGroups))
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Renderizar items simples */}
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          {subItem.disabled ? (
                            <span className="flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground opacity-50 cursor-not-allowed text-sm">
                              {subItem.title}
                            </span>
                          ) : (
                            <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                              <Link href={subItem.href}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      ))}

                      {/* Renderizar subgrupos colapsables */}
                      {item.subGroups?.map((subGroup) => (
                        <Collapsible
                          key={subGroup.title}
                          asChild
                          defaultOpen={hasActiveInSubGroup(subGroup)}
                          className="group/subgroup"
                        >
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton className="cursor-pointer font-medium">
                                <subGroup.icon className="size-3.5" />
                                <span>{subGroup.title}</span>
                                <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/subgroup:rotate-90" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-4 border-l pl-2 mt-1 space-y-0.5">
                                {subGroup.items.map((subGroupItem) => (
                                  <SidebarMenuSubButton
                                    key={subGroupItem.href}
                                    asChild
                                    isActive={isActive(subGroupItem.href)}
                                    className="h-7"
                                  >
                                    <Link href={subGroupItem.href}>
                                      <span className="text-xs">{subGroupItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        )}

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.disabled ? (
                    <SidebarMenuButton
                      tooltip={`${item.title} (Próximamente)`}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.href}>
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <_NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
