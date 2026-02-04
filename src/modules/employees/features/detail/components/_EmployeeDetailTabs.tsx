'use client';

import { Briefcase, Contact, FileText, User } from 'lucide-react';

import {
  UrlTabs,
  UrlTabsList,
  UrlTabsTrigger,
} from '@/shared/components/ui/url-tabs';

export type EmployeeDetailTab = 'personal' | 'contact' | 'work' | 'documents';

interface Props {
  employeeId: string;
  currentTab: EmployeeDetailTab;
  children: React.ReactNode;
}

export function _EmployeeDetailTabs({ employeeId, currentTab, children }: Props) {
  return (
    <UrlTabs
      value={currentTab}
      paramName="tab"
      baseUrl={`/dashboard/employees/${employeeId}`}
      className="w-full"
    >
      {/* Mobile: 2 columnas en 2 filas, Desktop: 4 columnas en 1 fila */}
      <UrlTabsList className="grid w-full grid-cols-2 gap-1 h-auto sm:grid-cols-4 sm:gap-0 sm:h-10">
        <UrlTabsTrigger value="personal" className="flex items-center justify-center gap-2 py-2 sm:py-1.5">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Datos Personales</span>
          <span className="sm:hidden text-xs">Personal</span>
        </UrlTabsTrigger>
        <UrlTabsTrigger value="contact" className="flex items-center justify-center gap-2 py-2 sm:py-1.5">
          <Contact className="h-4 w-4" />
          <span className="hidden sm:inline">Contacto</span>
          <span className="sm:hidden text-xs">Contacto</span>
        </UrlTabsTrigger>
        <UrlTabsTrigger value="work" className="flex items-center justify-center gap-2 py-2 sm:py-1.5">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Información Laboral</span>
          <span className="sm:hidden text-xs">Laboral</span>
        </UrlTabsTrigger>
        <UrlTabsTrigger value="documents" className="flex items-center justify-center gap-2 py-2 sm:py-1.5">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documentos</span>
          <span className="sm:hidden text-xs">Docs</span>
        </UrlTabsTrigger>
      </UrlTabsList>

      {children}
    </UrlTabs>
  );
}
