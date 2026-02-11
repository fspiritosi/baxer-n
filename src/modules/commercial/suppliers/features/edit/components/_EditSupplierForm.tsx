'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { _SupplierForm } from '../../create/components/_SupplierForm';
import { updateSupplier } from '../../list/actions.server';
import type { Supplier } from '../../../shared/types';
import type { CreateSupplierFormData } from '../../../shared/validators';
import { logger } from '@/shared/lib/logger';

interface EditSupplierFormProps {
  supplier: Supplier;
}

export function _EditSupplierForm({ supplier }: EditSupplierFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateSupplierFormData) => {
    setIsSubmitting(true);
    try {
      await updateSupplier(supplier.id, data);
      toast.success('Proveedor actualizado correctamente');
      router.push('/dashboard/commercial/suppliers');
      router.refresh();
    } catch (error) {
      logger.error('Error al actualizar proveedor', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al actualizar proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear CUIT para el formulario (agregar guiones)
  const formatTaxId = (taxId: string) => {
    if (taxId.length === 11) {
      return `${taxId.substring(0, 2)}-${taxId.substring(2, 10)}-${taxId.substring(10)}`;
    }
    return taxId;
  };

  const defaultValues: CreateSupplierFormData = {
    businessName: supplier.businessName,
    tradeName: supplier.tradeName || '',
    taxId: formatTaxId(supplier.taxId),
    taxCondition: supplier.taxCondition,
    email: supplier.email || '',
    phone: supplier.phone || '',
    website: supplier.website || '',
    address: supplier.address || '',
    city: supplier.city || '',
    state: supplier.state || '',
    zipCode: supplier.zipCode || '',
    country: supplier.country,
    paymentTermDays: supplier.paymentTermDays,
    creditLimit: supplier.creditLimit || undefined,
    contactName: supplier.contactName || '',
    contactPhone: supplier.contactPhone || '',
    contactEmail: supplier.contactEmail || '',
    notes: supplier.notes || '',
  };

  return (
    <_SupplierForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Cambios"
    />
  );
}
