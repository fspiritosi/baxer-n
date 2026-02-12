'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _SupplierForm } from './_SupplierForm';
import { createSupplier } from '../../list/actions.server';
import type { CreateSupplierFormData } from '../../../shared/validators';
import { logger } from '@/shared/lib/logger';

export function _CreateSupplierForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateSupplierFormData) => {
    setIsSubmitting(true);
    try {
      await createSupplier(data);
      toast.success('Proveedor creado correctamente');
      router.push('/dashboard/commercial/suppliers');
      router.refresh();
    } catch (error) {
      logger.error('Error al crear proveedor', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al crear proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <_SupplierForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Crear Proveedor"
    />
  );
}
