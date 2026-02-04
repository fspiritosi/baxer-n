import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InfoField, InfoFieldGroup } from '@/shared/components/common/InfoField';
import { displayValue } from '@/shared/utils/formatters';
import type { Employee } from '../actions.server';

interface Props {
  employee: Employee;
}

export function _ContactTab({ employee }: Props) {
  const addressDisplay = employee.street && employee.streetNumber
    ? `${employee.street} ${employee.streetNumber}`
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Teléfono" value={employee.phone} />
            <InfoField label="Email" value={employee.email} />
          </InfoFieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domicilio</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Dirección" value={addressDisplay} />
            <InfoField label="Código Postal" value={employee.postalCode} />
            <InfoField label="Provincia" value={employee.province?.name} />
            <InfoField label="Ciudad" value={employee.city?.name} />
          </InfoFieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
