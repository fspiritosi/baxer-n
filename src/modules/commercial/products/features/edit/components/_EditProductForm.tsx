'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _ProductForm } from '../../create/components/_ProductForm';
import { updateProduct } from '../../list/actions.server';
import type { UpdateProductFormData } from '../../../shared/validators';
import type { Product, ProductCategory } from '../../../shared/types';
import { logger } from '@/shared/lib/logger';

interface EditProductFormProps {
  product: Product;
  categories: ProductCategory[];
}

export function _EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateProductFormData) => {
    setIsSubmitting(true);
    try {
      await updateProduct(product.id, data);
      toast.success('Producto actualizado correctamente');
      router.push('/dashboard/commercial/products');
      router.refresh();
    } catch (error) {
      logger.error('Error al actualizar producto', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: UpdateProductFormData = {
    name: product.name,
    description: product.description || '',
    type: product.type,
    categoryId: product.categoryId || undefined,
    unitOfMeasure: product.unitOfMeasure,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    vatRate: product.vatRate,
    trackStock: product.trackStock,
    minStock: product.minStock || 0,
    maxStock: product.maxStock || undefined,
    barcode: product.barcode || '',
    internalCode: product.internalCode || '',
    brand: product.brand || '',
    model: product.model || '',
    status: product.status,
  };

  return (
    <_ProductForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Cambios"
      categories={categories}
      showStatus
    />
  );
}
