import { z } from 'zod';

// ====================================
// CASH REGISTER SCHEMAS
// ====================================

// Schema para crear/editar caja
export const cashRegisterSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  location: z.string().max(200, 'La ubicación no puede exceder 200 caracteres').optional().nullable(),
  isDefault: z.boolean().default(false),
});

// Schema para abrir sesión
export const openSessionSchema = z.object({
  cashRegisterId: z.string().uuid('Caja inválida'),
  openingBalance: z
    .string()
    .min(1, 'El saldo inicial es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Saldo inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) >= 0, 'El saldo inicial debe ser positivo o cero'),
  openingNotes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
});

// Schema para cerrar sesión
export const closeSessionSchema = z.object({
  sessionId: z.string().uuid('Sesión inválida'),
  actualBalance: z
    .string()
    .min(1, 'El saldo real es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Saldo inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) >= 0, 'El saldo real debe ser positivo o cero'),
  closingNotes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
});

// Schema para movimiento de caja
export const cashMovementSchema = z.object({
  sessionId: z.string().uuid('Sesión inválida'),
  cashRegisterId: z.string().uuid('Caja inválida'),
  type: z.enum(['INCOME', 'EXPENSE', 'ADJUSTMENT'], {
    message: 'Debe seleccionar un tipo de movimiento',
  }),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  reference: z.string().max(100, 'La referencia no puede exceder 100 caracteres').optional().nullable(),
  date: z.date({ message: 'La fecha es requerida' }),
});

// ====================================
// TYPE INFERENCE
// ====================================

export type CashRegisterFormData = z.infer<typeof cashRegisterSchema>;
export type OpenSessionFormData = z.infer<typeof openSessionSchema>;
export type CloseSessionFormData = z.infer<typeof closeSessionSchema>;
export type CashMovementFormData = z.infer<typeof cashMovementSchema>;

// ====================================
// LABELS Y MAPPERS
// ====================================

export const CASH_REGISTER_STATUS_LABELS = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
} as const;

export const CASH_REGISTER_STATUS_BADGES = {
  ACTIVE: 'default' as const,
  INACTIVE: 'secondary' as const,
};

export const SESSION_STATUS_LABELS = {
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
} as const;

export const SESSION_STATUS_BADGES = {
  OPEN: 'default' as const,
  CLOSED: 'secondary' as const,
};

export const CASH_MOVEMENT_TYPE_LABELS = {
  OPENING: 'Apertura',
  CLOSING: 'Cierre',
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso',
  ADJUSTMENT: 'Ajuste',
} as const;

export const CASH_MOVEMENT_TYPE_COLORS = {
  OPENING: 'blue',
  CLOSING: 'gray',
  INCOME: 'green',
  EXPENSE: 'red',
  ADJUSTMENT: 'yellow',
} as const;

// ====================================
// BANK ACCOUNT SCHEMAS
// ====================================

// Schema para crear/editar cuenta bancaria
export const bankAccountSchema = z.object({
  bankName: z
    .string()
    .min(1, 'El nombre del banco es requerido')
    .max(100, 'El nombre del banco no puede exceder 100 caracteres'),
  accountNumber: z
    .string()
    .min(1, 'El número de cuenta es requerido')
    .max(50, 'El número de cuenta no puede exceder 50 caracteres'),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'CREDIT'], {
    message: 'Debe seleccionar un tipo de cuenta',
  }),
  cbu: z
    .string()
    .length(22, 'El CBU debe tener exactamente 22 dígitos')
    .regex(/^\d{22}$/, 'El CBU solo puede contener números')
    .optional()
    .nullable(),
  alias: z
    .string()
    .min(6, 'El alias debe tener al menos 6 caracteres')
    .max(20, 'El alias no puede exceder 20 caracteres')
    .optional()
    .nullable(),
  currency: z.string().default('ARS'),
  balance: z
    .string()
    .regex(/^-?\d+(\.\d{1,2})?$/, 'Saldo inválido (máximo 2 decimales)')
    .optional()
    .default('0.00'),
  accountId: z.string().uuid('Cuenta contable inválida').optional().nullable(),
});

// Schema para movimiento bancario
export const bankMovementSchema = z.object({
  bankAccountId: z.string().uuid('Cuenta bancaria inválida'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'CHECK', 'DEBIT', 'FEE', 'INTEREST'], {
    message: 'Debe seleccionar un tipo de movimiento',
  }),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
  date: z.date({ message: 'La fecha es requerida' }),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  reference: z.string().max(100, 'La referencia no puede exceder 100 caracteres').optional().nullable(),
  statementNumber: z
    .string()
    .max(50, 'El número de extracto no puede exceder 50 caracteres')
    .optional()
    .nullable(),
});

// Schema para conciliación bancaria
export const reconcileBankMovementSchema = z.object({
  movementId: z.string().uuid('Movimiento inválido'),
  reconcile: z.boolean(),
});

// ====================================
// TYPE INFERENCE - BANK
// ====================================

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
export type BankMovementFormData = z.infer<typeof bankMovementSchema>;
export type ReconcileBankMovementFormData = z.infer<typeof reconcileBankMovementSchema>;

// ====================================
// LABELS Y MAPPERS - BANK
// ====================================

export const BANK_ACCOUNT_TYPE_LABELS = {
  CHECKING: 'Cuenta Corriente',
  SAVINGS: 'Caja de Ahorro',
  CREDIT: 'Cuenta de Crédito',
} as const;

export const BANK_ACCOUNT_STATUS_LABELS = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  CLOSED: 'Cerrada',
} as const;

export const BANK_ACCOUNT_STATUS_BADGES = {
  ACTIVE: 'default' as const,
  INACTIVE: 'secondary' as const,
  CLOSED: 'destructive' as const,
};

export const BANK_MOVEMENT_TYPE_LABELS = {
  DEPOSIT: 'Depósito',
  WITHDRAWAL: 'Extracción',
  TRANSFER_IN: 'Transferencia Recibida',
  TRANSFER_OUT: 'Transferencia Enviada',
  CHECK: 'Cheque',
  DEBIT: 'Débito Automático',
  FEE: 'Comisión',
  INTEREST: 'Interés',
} as const;

export const BANK_MOVEMENT_TYPE_COLORS = {
  DEPOSIT: 'green',
  WITHDRAWAL: 'red',
  TRANSFER_IN: 'blue',
  TRANSFER_OUT: 'orange',
  CHECK: 'purple',
  DEBIT: 'red',
  FEE: 'red',
  INTEREST: 'green',
} as const;

// ====================================
// RECEIPT SCHEMAS
// ====================================

// Schema para item de recibo (factura a cobrar)
export const receiptItemSchema = z.object({
  invoiceId: z.string().uuid('Factura inválida'),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
});

// Schema para pago de recibo (forma de pago)
export const receiptPaymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'DEBIT_CARD', 'CREDIT_CARD', 'ACCOUNT'], {
    message: 'Debe seleccionar una forma de pago',
  }),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
  cashRegisterId: z.string().uuid('Caja inválida').optional().nullable(),
  bankAccountId: z.string().uuid('Cuenta bancaria inválida').optional().nullable(),
  checkNumber: z.string().max(50, 'El número de cheque no puede exceder 50 caracteres').optional().nullable(),
  cardLast4: z
    .string()
    .length(4, 'Debe tener 4 dígitos')
    .regex(/^\d{4}$/, 'Solo números')
    .optional()
    .nullable(),
  reference: z.string().max(200, 'La referencia no puede exceder 200 caracteres').optional().nullable(),
});

// Schema para crear recibo
export const createReceiptSchema = z
  .object({
    customerId: z.string().uuid('Cliente inválido'),
    date: z.date({ message: 'La fecha es requerida' }),
    notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
    items: z.array(receiptItemSchema).min(1, 'Debe agregar al menos una factura a cobrar'),
    payments: z.array(receiptPaymentSchema).min(1, 'Debe agregar al menos una forma de pago'),
  })
  .refine(
    (data) => {
      // Validar que el total de items sea igual al total de pagos
      const totalItems = data.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalPayments = data.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      return Math.abs(totalItems - totalPayments) < 0.01; // Tolerancia de 1 centavo
    },
    {
      message: 'El total de facturas debe ser igual al total de pagos',
      path: ['payments'],
    }
  );

// ====================================
// TYPE INFERENCE - RECEIPTS
// ====================================

export type ReceiptItemFormData = z.infer<typeof receiptItemSchema>;
export type ReceiptPaymentFormData = z.infer<typeof receiptPaymentSchema>;
export type CreateReceiptFormData = z.infer<typeof createReceiptSchema>;

// ====================================
// LABELS Y MAPPERS - RECEIPTS
// ====================================

export const PAYMENT_METHOD_LABELS = {
  CASH: 'Efectivo',
  CHECK: 'Cheque',
  TRANSFER: 'Transferencia',
  DEBIT_CARD: 'Tarjeta de Débito',
  CREDIT_CARD: 'Tarjeta de Crédito',
  ACCOUNT: 'Cuenta Corriente',
} as const;

export const RECEIPT_STATUS_LABELS = {
  DRAFT: 'Borrador',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
} as const;

export const RECEIPT_STATUS_BADGES = {
  DRAFT: 'secondary' as const,
  CONFIRMED: 'default' as const,
  CANCELLED: 'destructive' as const,
};

// ====================================
// PAYMENT ORDER SCHEMAS
// ====================================

// Schema para item de orden de pago (factura a pagar)
export const paymentOrderItemSchema = z.object({
  invoiceId: z.string().uuid('Factura inválida'),
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (máximo 2 decimales)')
    .refine((val) => parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
});

// Schema para pago de orden (forma de pago) - reutilizamos receiptPaymentSchema ya que es idéntico
export const paymentOrderPaymentSchema = receiptPaymentSchema;

// Schema para crear orden de pago
export const createPaymentOrderSchema = z
  .object({
    supplierId: z.string().uuid('Proveedor inválido'),
    date: z.date({ message: 'La fecha es requerida' }),
    notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
    items: z.array(paymentOrderItemSchema).min(1, 'Debe agregar al menos una factura a pagar'),
    payments: z.array(paymentOrderPaymentSchema).min(1, 'Debe agregar al menos una forma de pago'),
  })
  .refine(
    (data) => {
      // Validar que el total de items sea igual al total de pagos
      const totalItems = data.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalPayments = data.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      return Math.abs(totalItems - totalPayments) < 0.01; // Tolerancia de 1 centavo
    },
    {
      message: 'El total de facturas debe ser igual al total de pagos',
      path: ['payments'],
    }
  );

// ====================================
// TYPE INFERENCE - PAYMENT ORDERS
// ====================================

export type PaymentOrderItemFormData = z.infer<typeof paymentOrderItemSchema>;
export type PaymentOrderPaymentFormData = z.infer<typeof paymentOrderPaymentSchema>;
export type CreatePaymentOrderFormData = z.infer<typeof createPaymentOrderSchema>;

// ====================================
// LABELS Y MAPPERS - PAYMENT ORDERS
// ====================================

export const PAYMENT_ORDER_STATUS_LABELS = {
  DRAFT: 'Borrador',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
} as const;

export const PAYMENT_ORDER_STATUS_BADGES = {
  DRAFT: 'secondary' as const,
  CONFIRMED: 'default' as const,
  CANCELLED: 'destructive' as const,
};
