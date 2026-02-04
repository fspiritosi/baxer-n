# NewProject

Sistema de gestión empresarial construido con Next.js 16, React 19, Prisma 7 y shadcn/ui.

## Requisitos Previos

- Node.js 18+ (recomendado 20+)
- Docker y Docker Compose
- npm

---

## 🚀 Configuración para Nueva Instancia (Cliente)

Este proyecto está diseñado para ser clonado y configurado fácilmente para diferentes clientes/empresas.

### Paso 1: Clonar e instalar

```bash
git clone <url-del-repositorio> nombre-cliente
cd nombre-cliente
npm install
```

### Paso 2: Editar configuración de instancia

Abre **`instance.config.ts`** en la raíz del proyecto y modifica los valores:

```typescript
export const instanceConfig: InstanceConfig = {
  // Identificador único (lowercase, sin espacios, guiones permitidos)
  id: 'acme-corp',

  // Branding (lo que verá el usuario)
  name: 'ACME Corporation',
  shortName: 'AC',                    // Para el logo (2-3 caracteres)
  description: 'Sistema de gestión ACME',

  // Puertos (cambiar si corres múltiples instancias en la misma máquina)
  ports: {
    app: 3000,           // Puerto de Next.js
    database: 5432,      // Puerto de PostgreSQL
    minioApi: 9000,      // Puerto de MinIO API
    minioConsole: 9001,  // Puerto de MinIO Console
  },

  // Base de datos
  database: {
    name: 'acme_db',     // Nombre de la base de datos
    user: 'postgres',    // Usuario de PostgreSQL
  },

  // Storage S3/MinIO
  storage: {
    bucket: 'documents',
    region: 'us-east-1',
  },
};
```

### Paso 3: Ejecutar script de configuración

```bash
npm run setup:instance
```

Este script actualiza automáticamente:
- ✅ `.env` - Variables de entorno (puertos, nombres, URLs)
- ✅ `docker-compose.yml` - Nombres de contenedores y puertos
- ✅ `package.json` - Nombre del proyecto
- ✅ `cypress.config.ts` - URL base para tests
- ✅ `next.config.ts` - Puerto de MinIO para imágenes

### Paso 4: Configurar credenciales en `.env`

Edita `.env` y agrega las credenciales sensibles:

```env
# Password de la base de datos
POSTGRES_PASSWORD="tu-password-seguro"

# Clerk (crear app en clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Resend (para envío de emails)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tudominio.com

# Storage S3/MinIO
S3_ACCESS_KEY="tu-access-key"
S3_SECRET_KEY="tu-secret-key"
```

### Paso 5: Levantar servicios Docker

```bash
# Solo base de datos
docker-compose up -d db

# Base de datos + MinIO (storage local)
docker-compose --profile storage up -d
```

### Paso 6: Configurar la base de datos

```bash
npm run db:generate
npm run db:push
npm run db:seed      # Opcional: datos iniciales
```

### Paso 7: Iniciar la aplicación

```bash
npm run dev
```

Abre `http://localhost:3000` (o el puerto que hayas configurado).

---

## Múltiples Instancias en la Misma Máquina

Si necesitas correr varias instancias simultáneamente, usa puertos diferentes en `instance.config.ts`:

| Instancia | App | PostgreSQL | MinIO API | MinIO Console |
|-----------|-----|------------|-----------|---------------|
| Cliente A | 3000 | 5432 | 9000 | 9001 |
| Cliente B | 3001 | 5433 | 9002 | 9003 |
| Cliente C | 3002 | 5434 | 9004 | 9005 |

---

## Comandos Disponibles

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera el build de producción |
| `npm run start` | Inicia el servidor de producción |

### Configuración de Instancia

| Comando | Descripción |
|---------|-------------|
| `npm run setup:instance` | Configura la instancia según `instance.config.ts` |

### Base de Datos (Prisma)

| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:push` | Aplica el schema a la BD (desarrollo) |
| `npm run db:migrate` | Crea una nueva migración |
| `npm run db:migrate:deploy` | Aplica migraciones en producción |
| `npm run db:studio` | Abre Prisma Studio (GUI para la BD) |
| `npm run db:seed` | Ejecuta el seed para poblar datos |

### Calidad de Código

| Comando | Descripción |
|---------|-------------|
| `npm run lint` | Ejecuta ESLint |
| `npm run lint:fix` | Corrige errores de ESLint automáticamente |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato sin modificar |
| `npm run check-types` | Verifica tipos de TypeScript |

### Testing (Cypress)

| Comando | Descripción |
|---------|-------------|
| `npm run cy:open` | Abre Cypress en modo interactivo |
| `npm run cy:run` | Ejecuta tests en modo headless |
| `npm run test:e2e` | Levanta el servidor y ejecuta tests |
| `npm run test:e2e:open` | Levanta el servidor y abre Cypress |

### Docker

```bash
# Levantar solo la base de datos
docker-compose up -d db

# Levantar base de datos + MinIO (storage)
docker-compose --profile storage up -d

# Ver logs de MinIO
docker-compose logs -f minio

# Detener todos los servicios
docker-compose --profile storage down

# Detener y eliminar volúmenes (reset completo)
docker-compose --profile storage down -v
```

---

## Servicios

### MinIO Console (Storage)

Cuando MinIO está corriendo:
- URL: `http://localhost:9001` (o puerto configurado)
- Usuario: `minioadmin`
- Password: `minioadmin123`

### Prisma Studio

```bash
npm run db:studio
```
Abre en [http://localhost:5555](http://localhost:5555)

---

## Tech Stack

- **Framework**: Next.js 16.1.3 + React 19
- **Base de Datos**: PostgreSQL + Prisma 7
- **UI**: shadcn/ui + Tailwind CSS v4
- **Autenticación**: Clerk
- **Estado**: Zustand + Jotai + React Query
- **Formularios**: React Hook Form + Zod
- **Storage**: MinIO (dev) / Cloudflare R2 (prod)

---

## Estructura del Proyecto

```
├── instance.config.ts     # ⭐ Configuración de instancia (editar aquí)
├── scripts/
│   └── setup-instance.ts  # Script de configuración automática
├── prisma/
│   └── schema.prisma      # Schema de base de datos
├── src/
│   ├── app/               # Routing (App Router)
│   │   ├── (auth)/        # Rutas de autenticación
│   │   └── (core)/        # Rutas principales (/dashboard/...)
│   ├── modules/           # Lógica de negocio por dominio
│   ├── shared/            # Código compartido
│   │   ├── components/    # UI components
│   │   ├── config/        # Configuración (incluye instance.ts)
│   │   ├── lib/           # Utilidades core
│   │   └── actions/       # Server actions compartidas
│   └── providers/         # React Context Providers
├── docker-compose.yml     # Servicios Docker (actualizado automáticamente)
└── .env                   # Variables de entorno (no commitear)
```

---

## Archivos de Configuración

| Archivo | Propósito | ¿Editar manualmente? |
|---------|-----------|---------------------|
| `instance.config.ts` | Configuración de la instancia | ✅ SÍ - Fuente de verdad |
| `.env` | Credenciales y secrets | ✅ SÍ - Solo credenciales |
| `docker-compose.yml` | Servicios Docker | ❌ NO - Se actualiza automáticamente |
| `package.json` | Dependencias y scripts | ❌ NO - Se actualiza automáticamente |

---

## Documentación Adicional

- **[CLAUDE.md](./CLAUDE.md)** - Guía completa para desarrollo
- **[INSTANCE-SETUP.md](./INSTANCE-SETUP.md)** - Documentación detallada de configuración de instancia
- **[.claude/rules/](./.claude/rules/)** - Reglas de código del proyecto
