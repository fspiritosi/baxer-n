import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { _CompanyForm } from '../../shared/components';

export function CompanyCreate() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/companies">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Building2 className="size-8 text-primary" />
          <div>
            <h1 data-testid="company-new-page-title" className="text-2xl font-bold">
              Nueva Empresa
            </h1>
            <p data-testid="company-new-page-description" className="text-sm text-muted-foreground">
              Crea una nueva empresa para gestionar tus recursos
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
          <CardDescription>
            Completa la información de tu empresa. Solo el nombre es obligatorio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <_CompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}
