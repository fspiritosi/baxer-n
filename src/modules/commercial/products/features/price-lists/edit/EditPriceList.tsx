import { checkPermission } from '@/shared/lib/permissions';
import { getPriceListById } from '../list/actions.server';
import { _EditPriceListForm } from './components/_EditPriceListForm';
import { notFound } from 'next/navigation';

interface EditPriceListProps {
  priceListId: string;
}

export async function EditPriceList({ priceListId }: EditPriceListProps) {
  await checkPermission('commercial.products', 'edit');

  const priceList = await getPriceListById(priceListId);

  if (!priceList) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Editar Lista de Precios</h1>
        <p className="text-sm text-muted-foreground">
          Modifica la información de: {priceList.name}
        </p>
      </div>

      <_EditPriceListForm priceList={priceList} />
    </div>
  );
}
