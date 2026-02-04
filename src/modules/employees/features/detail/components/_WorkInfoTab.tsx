import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InfoField, InfoFieldGroup } from '@/shared/components/common/InfoField';

import {
  formatDate,
  formatSeniorityParenthesis,
  displayValue,
} from '@/shared/utils/formatters';
import {
  costTypeLabels,
  unionAffiliationLabels,
  getLabel,
} from '@/shared/utils/mappers';
import type { Employee } from '../actions.server';

interface Props {
  employee: Employee;
}

export function _WorkInfoTab({ employee }: Props) {
  const hireDateDisplay = employee.hireDate
    ? `${formatDate(employee.hireDate)} ${formatSeniorityParenthesis(employee.hireDate)}`
    : 'No especificada';

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contratación</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Fecha de Ingreso" value={hireDateDisplay} />
            <InfoField
              label="Tipo de Contrato"
              value={employee.contractType?.name}
            />
            <InfoField
              label="Horas por Día"
              value={employee.workingHoursPerDay?.toString()}
            />
            <InfoField
              label="Tipo de Costo"
              value={getLabel(employee.costType, costTypeLabels)}
            />
          </InfoFieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Puesto y Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Puesto" value={employee.jobPosition?.name} />
            <InfoField label="Centro de Costo" value={employee.costCenter?.name} />
            <InfoField label="Categoría" value={employee.jobCategory?.name} />
            <InfoField
              label="Convenio"
              value={employee.jobCategory?.agreement?.name}
            />
            <InfoField
              label="Sindicato"
              value={employee.jobCategory?.agreement?.union?.name}
            />
            <InfoField
              label="Afiliación Sindical"
              value={getLabel(employee.unionAffiliationStatus, unionAffiliationLabels)}
            />
          </InfoFieldGroup>
        </CardContent>
      </Card>

      {/* Información de baja si aplica */}
      {!employee.isActive && (
        <Card className="md:col-span-2 border-destructive">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Información de Baja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoFieldGroup columns={3}>
              <InfoField
                label="Fecha de Baja"
                value={formatDate(employee.terminationDate)}
              />
              <InfoField
                label="Motivo de Baja"
                value={employee.terminationReason}
              />
              <InfoField label="Estado" value="Desvinculado" />
            </InfoFieldGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
