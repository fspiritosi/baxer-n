# Lógica Contable y Fiscal para Sistema de Gestión - Comprobantes y IVA

Este documento describe la lógica contable y fiscal que debe implementar el sistema para manejar correctamente la emisión y recepción de comprobantes fiscales (Facturas, Notas de Crédito, Notas de Débito) y el tratamiento del IVA, considerando los distintos tipos de contribuyentes en Argentina: **Responsable Inscripto (RI), Monotributo (MT), Exento (EX)**.

---

## 1. Tipos de Contribuyentes y Comprobantes Permitidos

| Tipo de Contribuyente | Puede Emitir | Puede Recibir |
|-----------------------|--------------|---------------|
| Responsable Inscripto (RI) | Factura A, Factura B, Nota Crédito A, Nota Crédito B, Nota Débito A, Nota Débito B | Factura A, Factura C, Nota Crédito A, Nota Crédito C, Nota Débito A, Nota Débito C |
| Monotributo (MT) | Factura C, Nota Crédito C, Nota Débito C | Factura A, Factura B, Nota Crédito A, Nota Crédito B, Nota Débito A, Nota Débito B |
| Exento (EX) | Factura E (o Factura B según normativa), Nota Crédito E, Nota Débito E | Factura A, Factura B, Factura C, Nota Crédito A, Nota Crédito B, Nota Crédito C, Nota Débito A, Nota Débito B, Nota Débito C |

> **Nota:** El sistema debe validar que el tipo de comprobante emitido o recibido sea compatible con el tipo de contribuyente emisor o receptor, según las tablas y reglas que se detallan más abajo.

---

## 2. Matriz de Validación de Comprobantes Emitidos

| Emisor \ Receptor | RI | MT | EX | Exterior |
|-------------------|----|----|----|----------|
| **RI** | Puede emitir Factura A (RI), Factura B (no RI) | Puede emitir Factura B | Puede emitir Factura B o Factura E | Exportación (sin IVA) |
| **MT** | Puede emitir Factura C | Puede emitir Factura C | Puede emitir Factura C o Factura E | Exportación (sin IVA) |
| **EX** | Puede emitir Factura E o B | Puede emitir Factura E o B | Puede emitir Factura E | Exportación (sin IVA) |

---

## 3. Matriz de Validación de Comprobantes Recibidos

| Receptor \ Emisor | RI | MT | EX | Exterior |
|-------------------|----|----|----|----------|
| **RI** | Puede recibir Factura A | Puede recibir Factura C | Puede recibir Factura E o B | Importación (sin IVA) |
| **MT** | Puede recibir Factura A | Puede recibir Factura C | Puede recibir Factura E o B | Importación (sin IVA) |
| **EX** | Puede recibir Factura A | Puede recibir Factura C | Puede recibir Factura E o B | Importación (sin IVA) |

---

## 4. Tratamiento Contable y Fiscal por Tipo de Operación

### 4.1 Ventas Emitidas

| Tipo Comprobante | Condición Receptor | IVA Débito Fiscal | Cuenta Deudores | Cuenta Ventas | Observaciones |
|------------------|--------------------|-------------------|-----------------|---------------|---------------|
| Factura A | RI | Sí | Debe: Total (Neto + IVA) | Haber: Neto | IVA discriminado y declarado |
| Factura B | No RI (Monotributo, Consumidor Final, Exento) | Sí | Debe: Total | Haber: Neto | IVA repercutido igual que A |
| Factura C | No puede emitir RI | N/A | N/A | N/A | No permitido para RI |
| Factura E | Exento | No | Debe: Total | Haber: Total | Sin IVA |

### 4.2 Compras Recibidas

| Tipo Comprobante | Condición Emisor | IVA Crédito Fiscal | Cuenta Proveedores | Cuenta Stock/Gasto | Observaciones |
|------------------|------------------|--------------------|--------------------|--------------------|---------------|
| Factura A | RI | Sí | Haber: Total | Debe: Neto | IVA crédito fiscal deducible |
| Factura C | MT | No | Haber: Total | Debe: Total | IVA no deducible, costo total |
| Factura E | EX | No | Haber: Total | Debe: Total | Sin IVA, costo total |
| Factura B | No permitido para RI | N/A | N/A | N/A | No permitido para RI |

### 4.3 Notas de Crédito y Débito

- **Notas de Crédito A/B:** Reversión parcial o total de ventas con IVA. Se disminuye IVA Débito Fiscal y Deudores.
- **Notas de Crédito C:** Reversión de compras a monotributistas, no afecta IVA Crédito Fiscal.
- **Notas de Débito A/B:** Incremento de ventas con IVA, aumenta IVA Débito Fiscal y Deudores.
- **Notas de Débito C:** Incremento de compras a monotributistas, no afecta IVA Crédito Fiscal.

---

## 5. Ejemplos de Asientos Contables

### 5.1 Venta con Factura A (RI a RI)

| Cuenta | Debe | Haber |
|--------|------|-------|
| Deudores por Ventas | Total (Neto + IVA) | |
| Ventas de Servicios / Bienes | | Neto |
| IVA Débito Fiscal | | IVA |

### 5.2 Compra con Factura A (RI a RI)

| Cuenta | Debe | Haber |
|--------|------|-------|
| Stock / Gasto | Neto | |
| IVA Crédito Fiscal | IVA | |
| Proveedores | | Total (Neto + IVA) |

### 5.3 Compra con Factura C (RI a MT)

| Cuenta | Debe | Haber |
|--------|------|-------|
| Stock / Gasto | Total (Neto + IVA) | |
| Proveedores | | Total (Neto + IVA) |

---

## 6. Reglas de Validación para el Sistema

- Validar que el tipo de comprobante emitido sea compatible con el estado fiscal del receptor.
- Validar que el tipo de comprobante recibido sea compatible con el estado fiscal del emisor.
- Para RI, solo aceptar IVA Crédito Fiscal de comprobantes válidos (Factura A, NC A, ND A).
- Para Monotributo y Exentos, no tomar crédito fiscal de IVA.
- Controlar que las Notas de Crédito y Débito referencien comprobantes válidos.
- Controlar que las operaciones de exportación estén correctamente identificadas y no generen IVA.
- Registrar percepciones y retenciones para su posterior imputación.
- Permitir imputar cada asiento a centros de costo o proyectos.

---

## 7. Tratamiento de Percepciones y Retenciones

| Tipo | Cuenta Débito | Cuenta Haber | Observaciones |
|-------|---------------|--------------|---------------|
| Percepción IVA recibida | Percepciones IVA a Favor (Activo) | Banco / Proveedores | Se puede imputar contra IVA a pagar |
| Retención IVA practicada | Retenciones y Percepciones a Depositar (Pasivo) | Banco / Proveedores | Se debe declarar y pagar a AFIP |
| Percepción IIBB recibida | Percepciones IIBB a Favor (Activo) | Banco / Proveedores | Similar a IVA |
| Retención IIBB practicada | Retenciones y Percepciones a Depositar (Pasivo) | Banco / Proveedores | Similar a IVA |

---

## 8. Resumen de Impacto en Cuentas Contables

| Operación      | Cuenta Debe   | Cuenta Haber   | IVA Débito | IVA Crédito | Observaciones       |
|----------------|---------------|----------------|------------|-------------|---------------------|
| Venta gravada  | Deudores      | Ventas         | Sí         | No          | Factura A o B       |
| Venta exenta   | Deudores      | Ventas Exentas | No         | No          | Factura E o similar |
| Compra gravada | Stock/Gasto   | Proveedores    | No         | Sí          | Factura A           |
| Compra monotributo | Stock/Gasto | Proveedores    | No         | No          | Factura C         |
| Nota de Crédito venta | Ventas | Deudores | Disminuye | No | NC A o B |
| Nota de Crédito compra | Proveedores | Stock/Gasto | No | Disminuye | NC A o C |
| Nota de Débito venta | Deudores | Ventas | Aumenta | No | ND A o B |
| Nota de Débito compra | Stock/Gasto | Proveedores | No | Aumenta | ND A o C |

---

## 9. Consideraciones para el Desarrollo

- Parametrizar tipos de comprobantes, alícuotas y estados fiscales.
- Implementar reglas de validación estrictas para emisión y recepción.
- Controlar la imputación correcta de IVA Débito y Crédito.
- Permitir imputación por centro de costo o proyecto.
- Registrar y controlar percepciones y retenciones.
- Generar reportes para libros IVA Ventas y Compras.
- Mantener trazabilidad entre comprobantes y asientos contables.

---

## 10. Glosario de Cuentas Clave

| Cuenta | Descripción |
|--------|-------------|
| Deudores por Ventas | Clientes a cobrar por ventas realizadas |
| Proveedores | Deudas con proveedores por compras |
| Ventas de Bienes / Servicios | Ingresos por ventas |
| Stock Insumos Informáticos | Inventario de bienes para reventa |
| IVA Débito Fiscal | IVA repercutido en ventas |
| IVA Crédito Fiscal | IVA soportado en compras deducible |
| Percepciones IVA a Favor | Percepciones de IVA pagadas y a imputar |
| Retenciones y Percepciones a Depositar | Retenciones practicadas y a pagar a AFIP |

---

¿Querés que te prepare también un archivo con ejemplos numéricos detallados para cada tipo de comprobante y operación?