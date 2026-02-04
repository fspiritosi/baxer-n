# Guía de Configuración de Instancia

Esta guía explica cómo configurar una nueva instancia del proyecto para un cliente diferente.

## Archivo de Configuración Central

Toda la configuración de la instancia está centralizada en **`instance.config.ts`** en la raíz del proyecto.

```typescript
// instance.config.ts
export const instanceConfig: InstanceConfig = {
  // Identificador único (lowercase, sin espacios)
  id: 'acme-corp',

  // Branding
  name: 'ACME Corporation',
  shortName: 'AC',  // Para el logo (2-3 caracteres)
  description: 'Sistema de gestión ACME',

  // Puertos (cambiar si corres múltiples instancias en la misma máquina)
  ports: {
    app: 3000,
    database: 5432,
    minioApi: 9000,
    minioConsole: 9001,
  },

  // Base de datos
  database: {
    name: 'acme_corp',
    user: 'postgres',
  },

  // Storage S3/MinIO
  storage: {
    bucket: 'documents',
    region: 'us-east-1',
  },
};
```

## Pasos para Configurar una Nueva Instancia

### 1. Clonar el repositorio

```bash
git clone <repo-url> mi-cliente
cd mi-cliente
```

### 2. Editar la configuración

Abre `instance.config.ts` y modifica los valores:

```typescript
export const instanceConfig: InstanceConfig = {
  id: 'mi-cliente',           // Identificador único
  name: 'Mi Cliente S.A.',    // Nombre completo
  shortName: 'MC',            // Abreviatura (logo)
  description: 'Sistema de gestión Mi Cliente',

  ports: {
    app: 3001,       // Diferente si corres múltiples instancias
    database: 5433,  // Diferente si corres múltiples instancias
    minioApi: 9002,
    minioConsole: 9003,
  },

  database: {
    name: 'mi_cliente_db',
    user: 'postgres',
  },

  storage: {
    bucket: 'mi-cliente-docs',
    region: 'us-east-1',
  },
};
```

### 3. Ejecutar el script de setup

```bash
npm run setup:instance
```

Este script automáticamente actualiza:
- `.env` (DATABASE_URL, puertos, nombre de app)
- `docker-compose.yml` (container names, puertos)
- `package.json` (nombre del proyecto)
- `cypress.config.ts` (baseUrl)
- `next.config.ts` (puerto MinIO para imágenes)

### 4. Configurar credenciales sensibles

Edita `.env` manualmente para agregar:

```env
# Base de datos
POSTGRES_PASSWORD="tu-password-seguro"

# Clerk (autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Resend (emails)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tudominio.com

# MinIO/S3 (storage)
S3_ACCESS_KEY="tu-access-key"
S3_SECRET_KEY="tu-secret-key"
```

### 5. Levantar servicios Docker

```bash
# Solo base de datos
docker-compose up -d db

# Base de datos + MinIO (storage S3 local)
docker-compose --profile storage up -d
```

### 6. Ejecutar migraciones

```bash
npm run db:push
npm run db:seed  # Opcional: datos iniciales
```

### 7. Iniciar la aplicación

```bash
npm run dev
```

Abre `http://localhost:{PUERTO_APP}` (ej: http://localhost:3001)

---

## Múltiples Instancias en la Misma Máquina

Si necesitas correr múltiples instancias en el mismo servidor de desarrollo, asegúrate de que cada una tenga **puertos diferentes**:

| Instancia | App | PostgreSQL | MinIO API | MinIO Console |
|-----------|-----|------------|-----------|---------------|
| Cliente A | 3000 | 5432 | 9000 | 9001 |
| Cliente B | 3001 | 5433 | 9002 | 9003 |
| Cliente C | 3002 | 5434 | 9004 | 9005 |

---

## Archivos que Lee la Configuración

El código de la aplicación importa la configuración desde:

```typescript
// En componentes y páginas
import { APP_NAME, APP_SHORT_NAME, APP_DESCRIPTION } from '@/shared/config/instance';

// Configuración completa
import { instanceConfig } from '@/shared/config/instance';
```

### Archivos que usan la configuración:

| Archivo | Uso |
|---------|-----|
| `src/app/layout.tsx` | Metadata (título, descripción) |
| `src/app/page.tsx` | Landing page (logo, nombre, footer) |
| `NoCompanyFallback.tsx` | Mensaje de bienvenida |
| `next.config.ts` | Puerto MinIO para imágenes |
| `cypress.config.ts` | URL base para tests |

---

## ¿Qué NO se actualiza automáticamente?

Los siguientes archivos requieren configuración manual:

1. **Credenciales en `.env`**: Passwords, API keys, secrets
2. **`prisma/seed.ts`**: IDs de usuarios de prueba (si usas)
3. **Logo/imágenes**: Si quieres cambiar de texto a imagen
4. **Clerk Dashboard**: Configurar nueva aplicación en clerk.com
5. **DNS/Dominio**: Configuración de producción

---

## Estructura de Archivos de Configuración

```
📁 project root
├── instance.config.ts         ← EDITAR AQUÍ (fuente de verdad)
├── scripts/
│   └── setup-instance.ts      ← Script que actualiza todo
├── .env                       ← Generado/actualizado (credenciales aquí)
├── docker-compose.yml         ← Actualizado automáticamente
├── package.json               ← Actualizado automáticamente
└── src/shared/config/
    └── instance.ts            ← Exporta config para el código
```

---

## Troubleshooting

### El puerto ya está en uso
Cambia los puertos en `instance.config.ts` y vuelve a ejecutar `npm run setup:instance`.

### Los contenedores Docker no inician
Verifica que los nombres de contenedor no colisionen:
```bash
docker ps -a | grep newproject  # Ver contenedores existentes
docker rm -f newproject-db      # Eliminar si es necesario
```

### Los cambios no se reflejan
1. Detén el servidor de desarrollo
2. Ejecuta `npm run setup:instance`
3. Reinicia los contenedores Docker
4. Inicia el servidor con `npm run dev`


<!--Este es un comentario de prueba para el commit -->