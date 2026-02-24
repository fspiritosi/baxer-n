# Ordenes de Compra

## Definición

Una **Orden de Compra** (OC) es un documento comercial formal mediante el cual una empresa (el comprador) solicita a un proveedor la entrega de bienes o la prestación de servicios bajo condiciones específicas acordadas.

## Características principales:

**Naturaleza jurídica**: Es una oferta de contrato que, una vez aceptada por el proveedor, se convierte en un compromiso legal vinculante para ambas partes.

**Elementos esenciales**:

- Número único de identificación (para trazabilidad)
- Fecha de emisión
- Datos del proveedor y del comprador (los determina la company actual)
- Descripción detallada de productos/servicios (deben estar en el listado de productos, si no estan, se pueden crear desde la misma OC)
- Cantidades solicitadas
- Precios unitarios y totales
- Condiciones de pago
- Plazo y lugar de entrega
- Condiciones especiales (garantías, penalidades, etc.)

## Función administrativa:

**Control presupuestario**: Compromete fondos antes del gasto efectivo, permitiendo control del presupuesto. (Si la orden de compra esta aprobada, se contempla en el cashflow como gasto, contemplando las condiciones de pago)

**Trazabilidad**: Vincula la solicitud inicial con la recepción de mercadería (debemos implementar Remitos, estos son tanto de Recepción de mercadería como de entrega a un cliente, siempre van a estar vinculados a la factura del proveedor o cliente según corresponda. 

**Autorización**: Formaliza la aprobación de una necesidad de compra por los responsables autorizados. (se debe manejar desde los permisos del sistema, algunos usuarios podrán crear OC, otros aprobarlas)

**Auditoría**: Genera un registro documental del proceso de adquisición.

Documento: Deben generar documentos imprimibles, lo mismo para los remitos.

## En el contexto argentino:

Para tu software de contabilidad, la OC es clave porque desencadena el circuito completo: OC → Remito de ingreso → Factura del proveedor → Registro contable → Pago. Además, en empresas que aplican devengado, la OC puede generar un asiento de compromiso que afecta la disponibilidad presupuestaria sin impactar aún el resultado.