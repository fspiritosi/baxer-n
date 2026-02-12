/**
 * Validaciones AFIP para emisión de comprobantes
 *
 * Reglas basadas en normativa AFIP:
 * - Emisor RI puede emitir: Factura A, B, NC A/B, ND A/B
 * - Emisor MT puede emitir: Factura C, NC C, ND C
 * - Emisor EX puede emitir: Factura E (o B), NC E, ND E
 *
 * Matriz Emisor → Receptor:
 * - RI → RI: Factura A
 * - RI → MT/EX/CF: Factura B
 * - MT → Cualquiera: Factura C
 * - EX → Cualquiera: Factura E o B
 */

import type { CustomerTaxCondition, TaxStatus } from '@/generated/prisma/enums';
import type { VoucherType } from '@/generated/prisma/enums';

// ============================================
// MAPPERS
// ============================================

/**
 * Mapea TaxStatus (de Company) a CustomerTaxCondition
 * MONOTRIBUTO → MONOTRIBUTISTA
 */
export function mapTaxStatusToCustomerTaxCondition(
  taxStatus: TaxStatus | null | undefined
): CustomerTaxCondition {
  if (!taxStatus) return 'CONSUMIDOR_FINAL';

  if (taxStatus === 'MONOTRIBUTO') {
    return 'MONOTRIBUTISTA';
  }

  // RESPONSABLE_INSCRIPTO y EXENTO son iguales en ambos enums
  return taxStatus as unknown as CustomerTaxCondition;
}

// ============================================
// TIPOS
// ============================================

export interface AFIPValidationResult {
  isValid: boolean;
  error?: string;
  allowedVoucherTypes?: VoucherType[];
}

// ============================================
// VALIDACIÓN PRINCIPAL
// ============================================

/**
 * Valida si un tipo de comprobante es válido según las condiciones fiscales
 * del emisor (empresa) y receptor (cliente)
 */
export function validateVoucherType(
  emisorTaxCondition: CustomerTaxCondition,
  receptorTaxCondition: CustomerTaxCondition,
  voucherType: VoucherType
): AFIPValidationResult {
  const allowedTypes = getAllowedVoucherTypes(emisorTaxCondition, receptorTaxCondition);

  if (!allowedTypes.includes(voucherType)) {
    const emisorLabel = getTaxConditionLabel(emisorTaxCondition);
    const receptorLabel = getTaxConditionLabel(receptorTaxCondition);

    return {
      isValid: false,
      error: `No se puede emitir "${getVoucherTypeLabel(voucherType)}" desde un emisor ${emisorLabel} hacia un receptor ${receptorLabel}. Tipos permitidos: ${allowedTypes.map(t => getVoucherTypeLabel(t)).join(', ')}`,
      allowedVoucherTypes: allowedTypes,
    };
  }

  return {
    isValid: true,
    allowedVoucherTypes: allowedTypes,
  };
}

/**
 * Obtiene los tipos de comprobante permitidos según emisor y receptor
 */
export function getAllowedVoucherTypes(
  emisorTaxCondition: CustomerTaxCondition,
  receptorTaxCondition: CustomerTaxCondition
): VoucherType[] {
  // Responsable Inscripto (RI)
  if (emisorTaxCondition === 'RESPONSABLE_INSCRIPTO') {
    if (receptorTaxCondition === 'RESPONSABLE_INSCRIPTO') {
      // RI → RI: Solo Factura A y sus derivados
      return [
        'FACTURA_A',
        'NOTA_CREDITO_A',
        'NOTA_DEBITO_A',
      ];
    } else {
      // RI → MT/EX/CF: Solo Factura B y sus derivados
      return [
        'FACTURA_B',
        'NOTA_CREDITO_B',
        'NOTA_DEBITO_B',
      ];
    }
  }

  // Monotributista (MT)
  if (emisorTaxCondition === 'MONOTRIBUTISTA') {
    // MT → Cualquiera: Solo Factura C y sus derivados
    return [
      'FACTURA_C',
      'NOTA_CREDITO_C',
      'NOTA_DEBITO_C',
      'RECIBO',
    ];
  }

  // Exento (EX)
  if (emisorTaxCondition === 'EXENTO') {
    // EX → Cualquiera: Factura B (por simplicidad, E no está implementado)
    return [
      'FACTURA_B',
      'NOTA_CREDITO_B',
      'NOTA_DEBITO_B',
    ];
  }

  // Consumidor Final (CF) - No puede emitir comprobantes fiscales
  if (emisorTaxCondition === 'CONSUMIDOR_FINAL') {
    return ['RECIBO']; // Solo recibos
  }

  // Fallback: permitir todos
  return [
    'FACTURA_A',
    'FACTURA_B',
    'FACTURA_C',
    'NOTA_CREDITO_A',
    'NOTA_CREDITO_B',
    'NOTA_CREDITO_C',
    'NOTA_DEBITO_A',
    'NOTA_DEBITO_B',
    'NOTA_DEBITO_C',
    'RECIBO',
  ];
}

/**
 * Valida si un emisor puede emitir comprobantes fiscales
 */
export function canEmitInvoices(emisorTaxCondition: CustomerTaxCondition): boolean {
  // Consumidores finales no pueden emitir facturas, solo recibos
  return emisorTaxCondition !== 'CONSUMIDOR_FINAL';
}

// ============================================
// HELPERS
// ============================================

function getTaxConditionLabel(taxCondition: CustomerTaxCondition): string {
  const labels: Record<CustomerTaxCondition, string> = {
    RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
    MONOTRIBUTISTA: 'Monotributista',
    EXENTO: 'Exento',
    CONSUMIDOR_FINAL: 'Consumidor Final',
  };
  return labels[taxCondition];
}

function getVoucherTypeLabel(voucherType: VoucherType): string {
  const labels: Partial<Record<VoucherType, string>> = {
    FACTURA_A: 'Factura A',
    FACTURA_B: 'Factura B',
    FACTURA_C: 'Factura C',
    NOTA_CREDITO_A: 'Nota de Crédito A',
    NOTA_CREDITO_B: 'Nota de Crédito B',
    NOTA_CREDITO_C: 'Nota de Crédito C',
    NOTA_DEBITO_A: 'Nota de Débito A',
    NOTA_DEBITO_B: 'Nota de Débito B',
    NOTA_DEBITO_C: 'Nota de Débito C',
    RECIBO: 'Recibo',
  };
  return labels[voucherType] || voucherType;
}
