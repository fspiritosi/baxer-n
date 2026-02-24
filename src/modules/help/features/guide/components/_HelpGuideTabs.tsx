'use client';

import {
  BookOpen,
  Building2,
  Calculator,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import {
  UrlTabs,
  UrlTabsContent,
  UrlTabsList,
  UrlTabsTrigger,
} from '@/shared/components/ui/url-tabs';

import { _AccountingGuide } from './_AccountingGuide';
import { _CommercialGuide } from './_CommercialGuide';
import { _CompanyGuide } from './_CompanyGuide';
import { _DashboardGuide } from './_DashboardGuide';
import { _DocumentsGuide } from './_DocumentsGuide';
import { _EmployeesGuide } from './_EmployeesGuide';
import { _EquipmentGuide } from './_EquipmentGuide';
import { _GettingStarted } from './_GettingStarted';
import { _TreasuryGuide } from './_TreasuryGuide';

type GuideTab =
  | 'inicio'
  | 'dashboard'
  | 'empleados'
  | 'equipamiento'
  | 'documentos'
  | 'comercial'
  | 'tesoreria'
  | 'contabilidad'
  | 'empresa';

const tabs: { value: GuideTab; label: string; icon: React.ElementType }[] = [
  { value: 'inicio', label: 'Primeros Pasos', icon: BookOpen },
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'empleados', label: 'Empleados', icon: Users },
  { value: 'equipamiento', label: 'Equipamiento', icon: Truck },
  { value: 'documentos', label: 'Documentos', icon: FileText },
  { value: 'comercial', label: 'Comercial', icon: ShoppingBag },
  { value: 'tesoreria', label: 'Tesorería', icon: Wallet },
  { value: 'contabilidad', label: 'Contabilidad', icon: Calculator },
  { value: 'empresa', label: 'Empresa', icon: Building2 },
];

const tabContent: Record<GuideTab, React.ReactNode> = {
  inicio: <_GettingStarted />,
  dashboard: <_DashboardGuide />,
  empleados: <_EmployeesGuide />,
  equipamiento: <_EquipmentGuide />,
  documentos: <_DocumentsGuide />,
  comercial: <_CommercialGuide />,
  tesoreria: <_TreasuryGuide />,
  contabilidad: <_AccountingGuide />,
  empresa: <_CompanyGuide />,
};

export function _HelpGuideTabs() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as GuideTab) || 'inicio';

  return (
    <UrlTabs value={currentTab} replace>
      <UrlTabsList className="flex-wrap h-auto gap-1">
        {tabs.map(({ value, label, icon: Icon }) => (
          <UrlTabsTrigger key={value} value={value}>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </UrlTabsTrigger>
        ))}
      </UrlTabsList>

      {tabs.map(({ value }) => (
        <UrlTabsContent key={value} value={value}>
          {tabContent[value]}
        </UrlTabsContent>
      ))}
    </UrlTabs>
  );
}
