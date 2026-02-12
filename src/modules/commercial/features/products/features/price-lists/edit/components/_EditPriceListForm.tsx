'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _PriceListForm } from '../../create/components/_PriceListForm';
import { updatePriceList } from '../../list/actions.server';
import type { UpdatePriceListFormData } from '../../../../shared/validators';
import type { PriceList } from '../../../../shared/types';
import { logger } from '@/shared/lib/logger';

interface EditPriceListFormProps {
  priceList: PriceList;
}

export function _EditPriceListForm({ priceList }: EditPriceListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdatePriceListFormData) => {
    setIsSubmitting(true);
    try {
      await updatePriceList(priceList.id, data);
      toast.success('Lista de precios actualizada correctamente');
      router.push('/dashboard/commercial/price-lists');
      router.refresh();
    } catch (error) {
      logger.error('Error al actualizar lista de precios', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al actualizar lista de precios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: UpdatePriceListFormData = {
    name: priceList.name,
    description: priceList.description || '',
    isDefault: priceList.isDefault,
    isActive: priceList.isActive,
  };

  return (
    <_PriceListForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Cambios"
    />
  );
}
