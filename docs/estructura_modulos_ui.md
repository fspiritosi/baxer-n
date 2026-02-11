## Objetivo

Acomodar la UI para la correcta navegación del usuario

## 1. Estructura del Sidebar

```
Principal
├── Dashboard/                    
│
├── Empleados/                     
│   └── [mantener igual]
│
├── Equipos/                     
│   └── [mantener igual]
│
├── Documentos/                     
│   └── [mantener igual]
│
├── Contabilidad/                     # Módulo existente - mejoras
│   └── [mejoras fiscales]
│
├── Comercial/                     # Módulo existente - Debe mostrar Dashboars de Comercial (No crear un item para el dashboard)
│   ├── Ventas/                     # Crear
│       ├── Clientes/               # Actualmente esta en Configuración/Empresa/Comercial  
│       ├── Leads/                  # Actualmente esta en Configuración/Empresa/Comercial
│       ├── Contactos/              # Actualmente esta en Configuración/Empresa/Comercial
│       ├── Cotizaciones/           # Actualmente esta en Configuración/Empresa/Comercial  y se llama "Presupuestos"
│       ├── Puntos de Venta/ 
│       ├── Facturas de Ventas/
│       ├── Reporte de Ventas/
│   └── Compras/                    # Crear
│       ├── Proveedores/
│       ├── Facturas de Compras/
│       └── validators/
│
├── Almacenes/                     # Crear - Debe mostrar Dashboars de Almacenes (No crear un item para el dashboard)
│   ├── Almacenes/  
│   ├── Productos/ 
│   ├── Listas de Precios/ 
│   ├── Inventario/                #Actualmente se llama control de Stock
│   └── Movimientos/               
│
├── Operaciones/                     # Módulo existente - mejoras
│   └── [mejoras fiscales]
│
└── Mantenimiento/                    # Módulo existente
    └── features/integrations/     # Nueva carpeta para integraciones
        └── commercial/
Configuración
Lo que ya existe
├── Almacenes/                    # Nuevo módulo padre
│   ├── categorias/                  # Traer acá

```
