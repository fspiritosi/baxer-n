import { getPointOfSaleById } from '../list/actions.server';
import { PointOfSaleForm } from '../create/components/_PointOfSaleForm';

interface EditPointOfSaleProps {
  id: string;
}

export async function EditPointOfSale({ id }: EditPointOfSaleProps) {
  const pointOfSale = await getPointOfSaleById(id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Editar Punto de Venta</h2>
        <p className="text-muted-foreground">
          Modifica la información del punto de venta{' '}
          <strong>{pointOfSale.number.toString().padStart(4, '0')}</strong>
        </p>
      </div>

      <PointOfSaleForm pointOfSale={pointOfSale} />
    </div>
  );
}
