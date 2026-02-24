# Retenciones en Argentina - Guía Técnica

## **¿Qué son las retenciones?**

Son un mecanismo donde **un agente de retención** (quien paga) debe retener una parte del pago y depositarla directamente a AFIP en nombre del **sujeto retenido** (quien cobra). Es un adelanto de impuestos.

### **Ejemplo simple:**
- Factura: $100,000 + IVA $21,000 = **$121,000 total**
- Retención IVA 10%: $2,100
- **Pago neto al proveedor: $118,900**
- Los $2,100 van a AFIP a cuenta de impuestos del proveedor

---

## **Tipos de Retenciones Más Comunes**

### **1. Retención de IVA**
- **Alícuota**: Variable (2% a 100% según régimen y operación)
- **Más común**: 10% o 21%
- **Agentes**: Empresas inscriptas en el "Régimen de Agentes de Retención IVA"
- **Base de cálculo**: Sobre el IVA de la factura

### **2. Retención de Ganancias**
- **Alícuota**: Variable (0.5% a 28% según tipo de operación)
- **Más común**: 2%, 3%, 6%
- **Agentes**: Inscriptos en RG 830 y modificatorias
- **Base de cálculo**: Sobre el neto (sin IVA)

### **3. Retención de Ingresos Brutos (IIBB)**
- **Alícuota**: Variable según provincia y actividad (1% a 5%)
- **Más común**: 2% a 3%
- **Ámbito**: Provincial/CABA (cada jurisdicción tiene su régimen)
- **Base de cálculo**: Generalmente sobre el neto

### **4. Retención SUSS (Seguridad Social)**
- **Alícuota**: Variable según servicio
- **Aplica a**: Servicios específicos (limpieza, vigilancia, etc.)
- **Base de cálculo**: Sobre el total facturado

---

## **Impacto según tu rol**

### **Como EMISOR de la retención (quien paga)**

#### **Operación:**
1. Recibís una factura: $100,000 + IVA $21,000 = $121,000
2. Calculás retenciones (ejemplo):
   - IVA 10%: $2,100
   - Ganancias 2%: $2,000
   - IIBB 3%: $3,000
3. **Pagás neto**: $121,000 - $2,100 - $2,000 - $3,000 = **$113,900**
4. Los $7,100 los depositás a AFIP/ARBA/etc. con un VEP/volante de pago

#### **Obligaciones:**
✓ Emitir **certificado de retención** (digital SICORE, SIFERE, SIRCAR, etc.)  
✓ **Depositar** las retenciones en fecha (normalmente mes siguiente)  
✓ Presentar **declaraciones juradas** mensuales  
✓ Entregar certificado al proveedor inmediatamente

#### **Contabilización:**
```
Debe:
  Servicios/Compras           $100,000
  IVA Crédito Fiscal           $21,000
Haber:
  Retenciones IVA por Pagar     $2,100
  Retenciones Gcias por Pagar   $2,000
  Retenciones IIBB por Pagar    $3,000
  Banco/Caja                  $113,900
```

---

### **Como RECEPTOR de la retención (quien cobra)**

#### **Operación:**
1. Emitís factura: $100,000 + IVA $21,000 = $121,000
2. Te pagan: $113,900 (con las retenciones del ejemplo anterior)
3. Recibís certificado de retención por $7,100
4. Usás ese certificado para **computar a cuenta** de tus impuestos

#### **Obligaciones:**
✓ **Verificar** que te entreguen el certificado  
✓ **Archivar** certificados para DDJJ  
✓ **Computar** en declaraciones juradas mensuales  
✓ Verificar que las retenciones estén **depositadas** (consulta AFIP)

#### **Contabilización:**
```
Debe:
  Banco/Caja                  $113,900
  Retención IVA Sufrida         $2,100
  Retención Gcias Sufrida       $2,000
  Retención IIBB Sufrida        $3,000
Haber:
  Ventas/Servicios            $100,000
  IVA Débito Fiscal            $21,000
```

#### **Cómo usás las retenciones:**
- **IVA**: Lo restás del IVA que debés pagar en tu DDJJ mensual
- **Ganancias**: Lo computás en la DDJJ anual o anticipos mensuales
- **IIBB**: Lo restás de IIBB provincial en DDJJ mensual

---

## **Regímenes y Normativa Principal**

| Impuesto | Normativa Principal | Sistema de Certificados |
|----------|-------------------|------------------------|
| IVA | RG 2854, RG 4967 | SICORE (AFIP) |
| Ganancias | RG 830, RG 2784 | SICORE (AFIP) |
| IIBB (ejemplo CABA) | Resolución 1/2020 | SIRCAR (AGIP) |
| IIBB (ejemplo PBA) | Normativa ARBA | SIFERE (ARBA) |

---

## **Consideraciones técnicas para tu software**

### **Datos que necesitás gestionar:**

#### **Por cliente/proveedor:**
- ¿Es agente de retención? (para cada impuesto)
- Alícuotas aplicables
- Inscripciones provinciales (IIBB)
- Exenciones/reducciones
- Condición IVA

#### **Por cada operación:**
- Tipo y número de comprobante
- Fecha
- Importes (neto, IVA, total)
- Retenciones aplicadas (tipo, alícuota, monto)
- Certificados emitidos/recibidos
- Fecha de depósito (si emitís)

#### **Funcionalidades clave:**
✓ **Cálculo automático** según padrones AFIP  
✓ **Generación de certificados** (formatos AFIP/ARBA/AGIP)  
✓ **Control de mínimos no retenibles** (hay montos mínimos)  
✓ **Conciliación** retenciones vs depósitos  
✓ **Reportes** para DDJJ mensuales  
✓ **Archivo de certificados** digitales

---

## **Ejemplo Completo de Flujo**

**Escenario:** Vendés servicios de desarrollo a una empresa grande

1. **Tu factura:**
   - Servicios: $500,000
   - IVA 21%: $105,000
   - **Total: $605,000**

2. **El cliente es agente de retención:**
   - Retención IVA 10%: $10,500
   - Retención Ganancias 2%: $10,000
   - **Total retenido: $20,500**

3. **Cobrás:**
   - **$584,500** en tu cuenta

4. **Recibís certificados:**
   - Certificado IVA por $10,500
   - Certificado Ganancias por $10,000

5. **En tu DDJJ mensual IVA:**
   - Débito fiscal: $105,000
   - Crédito fiscal: (tus compras)
   - **Retenciones sufridas: -$10,500**
   - = IVA a pagar (reducido)

6. **En tus anticipos/DDJJ anual Ganancias:**
   - **Pagos a cuenta: $10,000**
   - = Menos a pagar en el año

