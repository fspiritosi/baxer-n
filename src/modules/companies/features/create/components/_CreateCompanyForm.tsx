'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import { _CompanyForm } from '../../../shared/components';

interface CreateCompanyFormProps {
  isFirstCompany?: boolean;
}

export function _CreateCompanyForm({ isFirstCompany = false }: CreateCompanyFormProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isFirstCompany ? 'Crea tu primera empresa' : 'Nueva empresa'}
        </CardTitle>
        <CardDescription>
          {isFirstCompany
            ? 'Para comenzar a usar el sistema, necesitas crear una empresa.'
            : 'Completa los datos de la nueva empresa.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <_CompanyForm
          mode="create"
          showCancelButton={!isFirstCompany}
          submitLabel={isFirstCompany ? 'Crear y continuar' : 'Crear empresa'}
        />
      </CardContent>
    </Card>
  );
}
