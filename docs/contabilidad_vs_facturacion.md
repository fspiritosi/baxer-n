# Separación: Contabilidad vs Facturación

## Asientos Contables

- Registran movimientos Debe/Haber
- NO discriminan IVA en líneas individuales
- Son el resultado final de operaciones comerciales
- Siguen el principio de partida doble
- Son el libro oficial para auditorías

## Facturas (Módulo Comercial - Futuro)

- Discriminan IVA (Base Imponible, Alícuota, Monto IVA)
- Generan asientos automáticamente cuando se registran
- Son documentos comerciales con requisitos legales (AFIP)
- Contienen información del cliente/proveedor

## Ejemplo: Factura de Venta

**Factura emitida**: $1,210 (Neto: $1,000 + IVA 21%: $210)

Detalle de la factura:
- Base Imponible: $1,000
- Alícuota IVA: 21%
- IVA: $210
- Total: $1,210

**Asiento generado automáticamente**:

| Cuenta | Debe | Haber |
|--------|------|-------|
| Cuentas por Cobrar (1.1.2) | $1,210 | - |
| Ventas (4.1.1) | - | $1,000 |
| IVA Débito Fiscal (2.1.3) | - | $210 |

Balance: $1,210 = $1,000 + $210 ✓

## Ejemplo: Factura de Compra

**Factura recibida**: $605 (Neto: $500 + IVA 21%: $105)

Detalle de la factura:
- Base Imponible: $500
- Alícuota IVA: 21%
- IVA: $105
- Total: $605

**Asiento generado automáticamente**:

| Cuenta | Debe | Haber |
|--------|------|-------|
| Compras (5.1.1) | $500 | - |
| IVA Crédito Fiscal (1.1.4) | $105 | - |
| Cuentas por Pagar (2.1.2) | - | $605 |

Balance: $605 = $605 ✓

## Ventajas de esta Arquitectura

### 1. Separación de Responsabilidades Clara
- **Facturación**: Maneja documentos comerciales, clientes, productos, IVA
- **Contabilidad**: Maneja plan de cuentas, asientos, balances, estados financieros

### 2. Asientos Contables Simples y Estándar
- No necesitan conocer sobre productos, clientes o alícuotas de IVA
- Siguen estrictamente el principio de partida doble
- Son fáciles de auditar

### 3. IVA en el Contexto Correcto
- Los cálculos de IVA se hacen en el módulo de facturación donde tienen sentido
- La condición fiscal de la empresa se aplica automáticamente
- Los libros IVA Compras/Ventas se generan desde facturas, no desde asientos

### 4. Facilita Auditorías y Trazabilidad
- Cada asiento puede rastrearse a su documento origen (factura, recibo, etc.)
- Los documentos comerciales cumplen requisitos legales
- Los asientos son el registro contable oficial

### 5. Flexibilidad
- Permite registrar asientos manuales cuando no hay documento comercial
- Permite diferentes tipos de documentos (facturas, notas de crédito, recibos)
- Facilita integraciones con sistemas externos

## Flujo de Trabajo Recomendado

1. **Registrar Factura** → Módulo Comercial/Facturación
   - Ingreso de datos: cliente, productos, cantidades
   - Cálculo automático de IVA según condición fiscal
   - Generación de PDF con formato legal

2. **Generación Automática de Asiento** → Módulo Contable
   - Se crea automáticamente al aprobar la factura
   - Las cuentas se determinan según configuración
   - El asiento queda vinculado a la factura

3. **Registro del Asiento** → Módulo Contable
   - Validación de partida doble
   - Validación de fechas dentro del ejercicio fiscal
   - Numeración automática

4. **Reportes** → Ambos módulos
   - **Comercial**: Libro IVA Compras/Ventas, análisis de ventas
   - **Contable**: Balance, Estado de Resultados, Mayor Analítico

## Consideraciones para Implementación Futura

Cuando se implemente el módulo de facturación, deberá:

1. Mantener tabla de Facturas con campos de IVA
2. Vincular cada factura con su asiento contable generado
3. Permitir configurar cuentas contables por defecto
4. Implementar generación automática de asientos según tipo de documento
5. Cumplir requisitos legales de AFIP para facturación electrónica
