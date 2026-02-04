'use client';

import { Building2, Eye, MoreHorizontal, Pencil, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { CompanyListItem } from '../actions.server';

interface CompaniesTableProps {
  companies: CompanyListItem[];
}

export function _CompaniesTable({ companies }: CompaniesTableProps) {
  if (companies.length === 0) {
    return (
      <Card data-testid="companies-empty-state">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No hay empresas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea tu primera empresa para comenzar
          </p>
          <Button asChild className="mt-4" data-testid="companies-empty-create-button">
            <Link href="/dashboard/companies/new">Crear empresa</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-testid="companies-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Card key={company.id} data-testid={`company-card-${company.id}`} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle data-testid={`company-name-${company.id}`} className="text-lg">
                    {company.name}
                  </CardTitle>
                  {company.industry && (
                    <CardDescription data-testid={`company-industry-${company.id}`}>
                      {company.industry}
                    </CardDescription>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-testid={`company-actions-${company.id}`}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem data-testid={`company-view-${company.id}`} asChild>
                    <Link href={`/dashboard/companies/${company.id}`}>
                      <Eye className="mr-2 size-4" />
                      Ver detalles
                    </Link>
                  </DropdownMenuItem>
                  {company.isOwner && (
                    <DropdownMenuItem data-testid={`company-edit-${company.id}`} asChild>
                      <Link href={`/dashboard/companies/${company.id}/edit`}>
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.description && (
              <p
                data-testid={`company-description-${company.id}`}
                className="line-clamp-2 text-sm text-muted-foreground"
              >
                {company.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>
                  {company.memberCount} miembro{company.memberCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-1">
                {company.isOwner && <Badge variant="secondary">Propietario</Badge>}
              </div>
            </div>
            {(company.city || company.province) && (
              <p className="text-xs text-muted-foreground">
                {[company.city?.name, company.province?.name].filter(Boolean).join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
