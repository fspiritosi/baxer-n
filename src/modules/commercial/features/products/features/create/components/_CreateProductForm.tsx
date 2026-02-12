'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _ProductForm } from './_ProductForm';
import { createProduct } from '../../list/actions.server';
import type { CreateProductFormData } from '../../../shared/validators';
import type { ProductCategory } from '../../../shared/types';
import { logger } from '@/shared/lib/logger';

interface CreateProductFormProps {
  categories: ProductCategory[];
}

export function _CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProductFormData) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      toast.success('Producto creado correctamente');
      router.push('/dashboard/commercial/products');
      router.refresh();
    } catch (error) {
      logger.error('Error al crear producto', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al crear producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <_ProductForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Crear Producto"
      categories={categories}
    />
  );
}
