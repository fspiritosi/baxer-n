import { SupplierTaxCondition, SupplierStatus } from '@/generated/prisma/enums';

export interface Supplier extends Record<string, unknown> {
  id: string;
  companyId: string;
  code: string;
  businessName: string;
  tradeName: string | null;
  taxId: string;
  taxCondition: SupplierTaxCondition;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  paymentTermDays: number;
  creditLimit: number | null;
  defaultAccountId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: SupplierStatus;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierInput {
  businessName: string;
  tradeName?: string;
  taxId: string;
  taxCondition: SupplierTaxCondition;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTermDays?: number;
  creditLimit?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  status?: SupplierStatus;
}

// Labels para UI
export const SUPPLIER_TAX_CONDITION_LABELS: Record<SupplierTaxCondition, string> = {
  RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
  MONOTRIBUTISTA: 'Monotributista',
  EXENTO: 'Exento',
  NO_RESPONSABLE: 'No Responsable',
  CONSUMIDOR_FINAL: 'Consumidor Final',
};

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
};
