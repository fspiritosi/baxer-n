import { Button } from '@/shared/components/ui/button';
import { getActiveCompany } from '@/shared/lib/company';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyCompanies } from './actions.server';
import { _CompaniesTable } from './components/_CompaniesTable';
// import { getMyCompanies } from './actionsServer';

export async function CompaniesPage() {
  // Si está en single mode, redirigir directamente al detalle de la empresa
  const activeCompany = await getActiveCompany();
  if (activeCompany?.isSingleMode) {
    redirect(`/dashboard/companies/${activeCompany.id}`);
  }

  const companies = await getMyCompanies();

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="size-8 text-primary" />
          <div>
            <h1 data-testid="companies-page-title" className="text-2xl font-bold">
              Empresas
            </h1>
            <p data-testid="companies-page-description" className="text-sm text-muted-foreground">
              Gestiona las empresas a las que perteneces
            </p>
          </div>
        </div>
        <Button asChild data-testid="new-company-button">
          <Link href="/dashboard/companies/new">
            <Plus className="mr-2 size-4" />
            Nueva Empresa
          </Link>
        </Button>
      </div>

      {/* Table */}
      <_CompaniesTable companies={companies} />
    </div>
  );
}
