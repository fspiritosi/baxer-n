import { PointOfSaleForm } from './components/_PointOfSaleForm';

export function CreatePointOfSale() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Punto de Venta</h2>
        <p className="text-muted-foreground">
          Crea un nuevo punto de venta para la facturación
        </p>
      </div>

      <PointOfSaleForm />
    </div>
  );
}
