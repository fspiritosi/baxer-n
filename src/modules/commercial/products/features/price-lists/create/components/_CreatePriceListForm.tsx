'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _PriceListForm } from './_PriceListForm';
import { createPriceList } from '../../list/actions.server';
import type { CreatePriceListFormData } from '../../../../shared/validators';
import { logger } from '@/shared/lib/logger';

export function _CreatePriceListForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreatePriceListFormData) => {
    setIsSubmitting(true);
    try {
      const priceList = await createPriceList(data);
      toast.success('Lista de precios creada correctamente');
      router.push(`/dashboard/commercial/price-lists/${priceList.id}`);
      router.refresh();
    } catch (error) {
      logger.error('Error al crear lista de precios', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al crear lista de precios');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <_PriceListForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Crear Lista"
    />
  );
}
