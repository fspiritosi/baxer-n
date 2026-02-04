import { InfoField, InfoFieldGroup } from '@/shared/components/common/InfoField';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { formatAgeParenthesis, formatDate } from '@/shared/utils/formatters';
import {
  educationLevelLabels,
  genderLabels,
  getLabel,
  identityDocumentTypeLabels,
  maritalStatusLabels,
} from '@/shared/utils/mappers';
import type { Employee } from '../actions.server';

interface Props {
  employee: Employee;
}

export function _PersonalInfoTab({ employee }: Props) {
  const birthDateDisplay = employee.birthDate
    ? `${formatDate(employee.birthDate)} ${formatAgeParenthesis(employee.birthDate)}`
    : 'No especificada';

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identificación</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField
              label="Tipo de Documento"
              value={getLabel(employee.identityDocumentType, identityDocumentTypeLabels)}
            />
            <InfoField label="Número de Documento" value={employee.documentNumber} />
            <InfoField label="CUIL" value={employee.cuil} />
            <InfoField label="Legajo" value={employee.employeeNumber} />
          </InfoFieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Nombre" value={employee.firstName} />
            <InfoField label="Apellido" value={employee.lastName} />
            <InfoField label="Fecha de Nacimiento" value={birthDateDisplay} />
            <InfoField label="Género" value={getLabel(employee.gender, genderLabels)} />
            <InfoField
              label="Estado Civil"
              value={getLabel(employee.maritalStatus, maritalStatusLabels)}
            />
            <InfoField
              label="Nivel Educativo"
              value={getLabel(employee.educationLevel, educationLevelLabels)}
            />
            <InfoField label="Nacionalidad" value={employee.nationality?.name} />
            <InfoField label="Lugar de Nacimiento" value={employee.birthPlace?.name} />
          </InfoFieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
