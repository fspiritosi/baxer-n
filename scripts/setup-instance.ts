#!/usr/bin/env npx tsx
/**
 * Script de configuración de instancia
 *
 * Este script lee instance.config.ts y actualiza automáticamente:
 * - .env (genera desde .env.template o actualiza existente)
 * - docker-compose.yml (container names, puertos)
 * - package.json (name)
 *
 * Uso: npm run setup:instance
 *      npx tsx scripts/setup-instance.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Importar configuración
import { instanceConfig } from '../instance.config';

const ROOT_DIR = path.resolve(__dirname, '..');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('');
  log(`━━━ ${title} ━━━`, 'cyan');
}

function logSuccess(message: string) {
  log(`  ✓ ${message}`, 'green');
}

function logWarning(message: string) {
  log(`  ⚠ ${message}`, 'yellow');
}

function logError(message: string) {
  log(`  ✗ ${message}`, 'red');
}

/**
 * Actualiza package.json con el nombre de la instancia
 */
function updatePackageJson() {
  logSection('Actualizando package.json');

  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  const oldName = packageJson.name;
  packageJson.name = instanceConfig.id;

  // Actualizar scripts de test con el nuevo puerto
  if (packageJson.scripts) {
    const appUrl = `http://localhost:${instanceConfig.ports.app}`;
    if (packageJson.scripts['test:e2e']) {
      packageJson.scripts['test:e2e'] = `start-server-and-test dev ${appUrl} cy:run`;
    }
    if (packageJson.scripts['test:e2e:open']) {
      packageJson.scripts['test:e2e:open'] = `start-server-and-test dev ${appUrl} cy:open`;
    }
  }

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

  if (oldName !== instanceConfig.id) {
    logSuccess(`name: "${oldName}" → "${instanceConfig.id}"`);
  } else {
    logSuccess(`name: "${instanceConfig.id}" (sin cambios)`);
  }
}

/**
 * Actualiza docker-compose.yml con los valores de la instancia
 */
function updateDockerCompose() {
  logSection('Actualizando docker-compose.yml');

  const composePath = path.join(ROOT_DIR, 'docker-compose.yml');
  let content = fs.readFileSync(composePath, 'utf-8');

  const { id, ports, database, storage } = instanceConfig;

  // Actualizar comentarios del header
  content = content.replace(
    /# - Puerto: \d+/g,
    (match) => {
      if (match.includes('5432') || content.indexOf(match) < content.indexOf('MinIO')) {
        return `# - Puerto: ${ports.database}`;
      }
      return match;
    }
  );
  content = content.replace(/# - Base de datos: \w+/, `# - Base de datos: ${database.name}`);
  content = content.replace(/# - API S3: http:\/\/localhost:\d+/, `# - API S3: http://localhost:${ports.minioApi}`);
  content = content.replace(/# - Console: http:\/\/localhost:\d+/, `# - Console: http://localhost:${ports.minioConsole}`);

  // Actualizar project name (para que la red se llame {id}_default)
  content = content.replace(/^name: .+$/m, `name: ${id}`);

  // Actualizar container names
  content = content.replace(/container_name: [\w-]+-db/, `container_name: ${id}-db`);
  content = content.replace(/container_name: [\w-]+-minio\b/, `container_name: ${id}-minio`);
  content = content.replace(/container_name: [\w-]+-minio-init/, `container_name: ${id}-minio-init`);

  // Actualizar puertos
  content = content.replace(/'(\d+):5432'/, `'${ports.database}:5432'`);
  content = content.replace(/'(\d+):9000'\s+# API/, `'${ports.minioApi}:9000'   # API`);
  content = content.replace(/'(\d+):9001'\s+# Console/, `'${ports.minioConsole}:9001'   # Console`);

  // Actualizar defaults
  content = content.replace(/POSTGRES_DB:-\w+/, `POSTGRES_DB:-${database.name}`);
  content = content.replace(/S3_BUCKET:-\w+/, `S3_BUCKET:-${storage.bucket}`);

  fs.writeFileSync(composePath, content);

  logSuccess(`project name: ${id} (red: ${id}_default)`);
  logSuccess(`container_name: ${id}-db, ${id}-minio, ${id}-minio-init`);
  logSuccess(`ports: db=${ports.database}, minio-api=${ports.minioApi}, minio-console=${ports.minioConsole}`);
}

/**
 * Actualiza o genera .env con los valores de la instancia
 */
function updateEnvFile() {
  logSection('Actualizando .env');

  const envPath = path.join(ROOT_DIR, '.env');

  if (!fs.existsSync(envPath)) {
    logWarning('.env no existe, creando desde .env.example...');
    const examplePath = path.join(ROOT_DIR, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
    } else {
      logError('.env.example no existe. Crea .env manualmente.');
      return;
    }
  }

  let content = fs.readFileSync(envPath, 'utf-8');
  const { id, name, ports, database, storage } = instanceConfig;

  // Función helper para actualizar o agregar variable
  const updateEnvVar = (key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}="${value}"`);
    }
  };

  // Extraer POSTGRES_PASSWORD del .env (fuente de verdad para el password)
  const postgresPasswordMatch = content.match(/^POSTGRES_PASSWORD="([^"]+)"/m);
  const dbPassword = postgresPasswordMatch ? postgresPasswordMatch[1] : 'postgres';

  // Extraer host existente del DATABASE_URL (localhost o db para Docker)
  const dbUrlMatch = content.match(/DATABASE_URL="postgresql:\/\/[^:]+:[^@]+@([^:]+):/);
  const existingHost = dbUrlMatch ? dbUrlMatch[1] : 'localhost';

  // Construir DATABASE_URL usando POSTGRES_PASSWORD como fuente de verdad
  const newDbUrl = `postgresql://${database.user}:${dbPassword}@${existingHost}:${ports.database}/${database.name}?schema=public`;
  updateEnvVar('DATABASE_URL', newDbUrl);

  // Actualizar variables de la app
  updateEnvVar('NEXT_PUBLIC_APP_URL', `http://localhost:${ports.app}`);
  updateEnvVar('NEXT_PUBLIC_APP_NAME', name);

  // Actualizar variables de Docker/Postgres (mantener sincronizados)
  updateEnvVar('POSTGRES_USER', database.user);
  updateEnvVar('POSTGRES_DB', database.name);
  // POSTGRES_PASSWORD no se toca - es la fuente de verdad que el usuario configura manualmente

  // Actualizar variables de S3/MinIO
  updateEnvVar('S3_ENDPOINT', `http://localhost:${ports.minioApi}`);
  updateEnvVar('S3_BUCKET', storage.bucket);
  updateEnvVar('S3_REGION', storage.region);

  fs.writeFileSync(envPath, content);

  logSuccess(`DATABASE_URL actualizado con puerto ${ports.database} y BD "${database.name}"`);
  logSuccess(`NEXT_PUBLIC_APP_URL: http://localhost:${ports.app}`);
  logSuccess(`NEXT_PUBLIC_APP_NAME: ${name}`);
  logSuccess(`S3_ENDPOINT: http://localhost:${ports.minioApi}`);
}

/**
 * Actualiza cypress.config.ts con el nuevo puerto
 */
function updateCypressConfig() {
  logSection('Actualizando cypress.config.ts');

  const cypressPath = path.join(ROOT_DIR, 'cypress.config.ts');

  if (!fs.existsSync(cypressPath)) {
    logWarning('cypress.config.ts no existe, saltando...');
    return;
  }

  let content = fs.readFileSync(cypressPath, 'utf-8');
  const { ports } = instanceConfig;

  // Actualizar baseUrl
  content = content.replace(
    /baseUrl:\s*['"]http:\/\/localhost:\d+['"]/,
    `baseUrl: 'http://localhost:${ports.app}'`
  );

  fs.writeFileSync(cypressPath, content);
  logSuccess(`baseUrl: http://localhost:${ports.app}`);
}

/**
 * Actualiza next.config.ts con los puertos de MinIO
 */
function updateNextConfig() {
  logSection('Actualizando next.config.ts');

  const nextConfigPath = path.join(ROOT_DIR, 'next.config.ts');

  if (!fs.existsSync(nextConfigPath)) {
    logWarning('next.config.ts no existe, saltando...');
    return;
  }

  let content = fs.readFileSync(nextConfigPath, 'utf-8');
  const { ports } = instanceConfig;

  // Actualizar puerto de MinIO en images config
  content = content.replace(
    /port:\s*'(\d+)',\s*\/\/\s*MinIO/,
    `port: '${ports.minioApi}', // MinIO`
  );

  // También actualizar si está en formato diferente
  content = content.replace(
    /hostname:\s*'localhost',\s*\n\s*port:\s*'(\d+)'/,
    `hostname: 'localhost',\n        port: '${ports.minioApi}'`
  );

  fs.writeFileSync(nextConfigPath, content);
  logSuccess(`MinIO port en images: ${ports.minioApi}`);
}

/**
 * Muestra resumen de la configuración
 */
function showSummary() {
  logSection('Resumen de la Instancia');

  console.log('');
  log(`  ID:          ${instanceConfig.id}`, 'blue');
  log(`  Nombre:      ${instanceConfig.name}`, 'blue');
  log(`  Abreviatura: ${instanceConfig.shortName}`, 'blue');
  log(`  Descripción: ${instanceConfig.description}`, 'blue');
  console.log('');
  log('  Puertos:', 'blue');
  log(`    - App:          ${instanceConfig.ports.app}`, 'blue');
  log(`    - PostgreSQL:   ${instanceConfig.ports.database}`, 'blue');
  log(`    - MinIO API:    ${instanceConfig.ports.minioApi}`, 'blue');
  log(`    - MinIO Console: ${instanceConfig.ports.minioConsole}`, 'blue');
  console.log('');
  log('  Base de Datos:', 'blue');
  log(`    - Nombre: ${instanceConfig.database.name}`, 'blue');
  log(`    - Usuario: ${instanceConfig.database.user}`, 'blue');
  console.log('');
}

/**
 * Muestra instrucciones post-setup
 */
function showInstructions() {
  logSection('Siguientes Pasos');

  console.log('');
  log('  1. Revisa y configura las credenciales en .env:', 'yellow');
  log('     - POSTGRES_PASSWORD (password de la BD)', 'reset');
  log('     - CLERK_SECRET_KEY (autenticación)', 'reset');
  log('     - RESEND_API_KEY (emails)', 'reset');
  log('     - S3_ACCESS_KEY, S3_SECRET_KEY (storage)', 'reset');
  console.log('');
  log('  2. Levanta los servicios Docker:', 'yellow');
  log(`     docker-compose up -d db`, 'reset');
  log(`     docker-compose --profile storage up -d  # Si usas MinIO`, 'reset');
  console.log('');
  log('  3. Genera el cliente Prisma, aplica el schema y ejecuta el seed:', 'yellow');
  log('     npm run db:generate', 'reset');
  log('     npm run db:push', 'reset');
  log('     npm run db:seed', 'reset');
  console.log('');
  log('  4. Inicia el servidor:', 'yellow');
  log('     npm run dev', 'reset');
  console.log('');
  log(`  5. Abre http://localhost:${instanceConfig.ports.app}`, 'yellow');
  console.log('');
}

// Ejecutar
function main() {
  console.log('');
  log('╔════════════════════════════════════════════════════╗', 'cyan');
  log('║     SETUP DE INSTANCIA - Configuración Inicial     ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');

  showSummary();

  try {
    updatePackageJson();
    updateDockerCompose();
    updateEnvFile();
    updateCypressConfig();
    updateNextConfig();

    console.log('');
    log('═══════════════════════════════════════════════════════', 'green');
    log('  ✓ Configuración completada exitosamente!', 'green');
    log('═══════════════════════════════════════════════════════', 'green');

    showInstructions();
  } catch (error) {
    console.log('');
    logError(`Error durante la configuración: ${error}`);
    process.exit(1);
  }
}

main();
