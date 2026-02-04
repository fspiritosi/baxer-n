import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ============================================
// USUARIO OWNER Y TEST (Clerk user ID)
// ============================================
// Usuario principal con email yordanpz+clerk_test@hotmail.com
// Usado tanto para desarrollo como para tests de Cypress
const OWNER_USER_ID = 'user_38XttXTm0XNDYKYMkyCUCgSnNjI';

// ============================================
// CÓDIGOS ISO PARA PAÍSES (mapeo nombre -> código)
// ============================================
const countryCodeMap: Record<string, string> = {
  Afganistán: 'AF',
  Albania: 'AL',
  Alemania: 'DE',
  Andorra: 'AD',
  Angola: 'AO',
  'Antigua y Barbuda': 'AG',
  'Arabia Saudita': 'SA',
  Argelia: 'DZ',
  Argentina: 'AR',
  Armenia: 'AM',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaiyán: 'AZ',
  Bahamas: 'BS',
  Bangladés: 'BD',
  Barbados: 'BB',
  Baréin: 'BH',
  Bélgica: 'BE',
  Belice: 'BZ',
  Benín: 'BJ',
  Bielorrusia: 'BY',
  Birmania: 'MM',
  Bolivia: 'BO',
  'Bosnia y Herzegovina': 'BA',
  Botsuana: 'BW',
  Brasil: 'BR',
  Brunéi: 'BN',
  Bulgaria: 'BG',
  'Burkina Faso': 'BF',
  Burundi: 'BI',
  Bután: 'BT',
  'Cabo Verde': 'CV',
  Camboya: 'KH',
  Camerún: 'CM',
  Canadá: 'CA',
  Catar: 'QA',
  Chad: 'TD',
  Chile: 'CL',
  China: 'CN',
  Chipre: 'CY',
  'Ciudad del Vaticano': 'VA',
  Colombia: 'CO',
  Comoras: 'KM',
  'Corea del Norte': 'KP',
  'Corea del Sur': 'KR',
  'Costa de Marfil': 'CI',
  'Costa Rica': 'CR',
  Croacia: 'HR',
  Cuba: 'CU',
  Dinamarca: 'DK',
  Dominica: 'DM',
  Ecuador: 'EC',
  Egipto: 'EG',
  'El Salvador': 'SV',
  'Emiratos Árabes Unidos': 'AE',
  Eritrea: 'ER',
  Eslovaquia: 'SK',
  Eslovenia: 'SI',
  España: 'ES',
  'Estados Unidos': 'US',
  Estonia: 'EE',
  Etiopía: 'ET',
  Filipinas: 'PH',
  Finlandia: 'FI',
  Fiyi: 'FJ',
  Francia: 'FR',
  Gabón: 'GA',
  Gambia: 'GM',
  Georgia: 'GE',
  Ghana: 'GH',
  Granada: 'GD',
  Grecia: 'GR',
  Guatemala: 'GT',
  Guinea: 'GN',
  'Guinea ecuatorial': 'GQ',
  'Guinea-Bisáu': 'GW',
  Guyana: 'GY',
  Haití: 'HT',
  Honduras: 'HN',
  Hungría: 'HU',
  India: 'IN',
  Indonesia: 'ID',
  Irak: 'IQ',
  Irán: 'IR',
  Irlanda: 'IE',
  Islandia: 'IS',
  'Islas Marshall': 'MH',
  'Islas Salomón': 'SB',
  Israel: 'IL',
  Italia: 'IT',
  Jamaica: 'JM',
  Japón: 'JP',
  Jordania: 'JO',
  Kazajistán: 'KZ',
  Kenia: 'KE',
  Kirguistán: 'KG',
  Kiribati: 'KI',
  Kuwait: 'KW',
  Laos: 'LA',
  Lesoto: 'LS',
  Letonia: 'LV',
  Líbano: 'LB',
  Liberia: 'LR',
  Libia: 'LY',
  Liechtenstein: 'LI',
  Lituania: 'LT',
  Luxemburgo: 'LU',
  'Macedonia del Norte': 'MK',
  Madagascar: 'MG',
  Malasia: 'MY',
  Malaui: 'MW',
  Maldivas: 'MV',
  Malí: 'ML',
  Malta: 'MT',
  Marruecos: 'MA',
  Mauricio: 'MU',
  Mauritania: 'MR',
  México: 'MX',
  Micronesia: 'FM',
  Moldavia: 'MD',
  Mónaco: 'MC',
  Mongolia: 'MN',
  Montenegro: 'ME',
  Mozambique: 'MZ',
  Namibia: 'NA',
  Nauru: 'NR',
  Nepal: 'NP',
  Nicaragua: 'NI',
  Níger: 'NE',
  Nigeria: 'NG',
  Noruega: 'NO',
  'Nueva Zelanda': 'NZ',
  Omán: 'OM',
  'Países Bajos': 'NL',
  Pakistán: 'PK',
  Palaos: 'PW',
  Panamá: 'PA',
  'Papúa Nueva Guinea': 'PG',
  Paraguay: 'PY',
  Perú: 'PE',
  Polonia: 'PL',
  Portugal: 'PT',
  'Reino Unido': 'GB',
  'República Centroafricana': 'CF',
  'República Checa': 'CZ',
  'República del Congo': 'CG',
  'República Democrática del Congo': 'CD',
  'República Dominicana': 'DO',
  Ruanda: 'RW',
  Rumanía: 'RO',
  Rusia: 'RU',
  Samoa: 'WS',
  'San Cristóbal y Nieves': 'KN',
  'San Marino': 'SM',
  'San Vicente y las Granadinas': 'VC',
  'Santa Lucía': 'LC',
  'Santo Tomé y Príncipe': 'ST',
  Senegal: 'SN',
  Serbia: 'RS',
  Seychelles: 'SC',
  'Sierra Leona': 'SL',
  Singapur: 'SG',
  Siria: 'SY',
  Somalia: 'SO',
  'Sri Lanka': 'LK',
  Suazilandia: 'SZ',
  Sudáfrica: 'ZA',
  Sudán: 'SD',
  'Sudán del Sur': 'SS',
  Suecia: 'SE',
  Suiza: 'CH',
  Surinam: 'SR',
  Tailandia: 'TH',
  Tanzania: 'TZ',
  Tayikistán: 'TJ',
  'Timor Oriental': 'TL',
  Togo: 'TG',
  Tonga: 'TO',
  'Trinidad y Tobago': 'TT',
  Túnez: 'TN',
  Turkmenistán: 'TM',
  Turquía: 'TR',
  Tuvalu: 'TV',
  Ucrania: 'UA',
  Uganda: 'UG',
  Uruguay: 'UY',
  Uzbekistán: 'UZ',
  Vanuatu: 'VU',
  Venezuela: 'VE',
  Vietnam: 'VN',
  Yemen: 'YE',
  Yibuti: 'DJ',
  Zambia: 'ZM',
  Zimbabue: 'ZW',
};

// ============================================
// FUNCIONES PARA PARSEAR ARCHIVOS SQL
// ============================================

function parseCountriesFromSQL(sqlContent: string): Array<{ name: string; code: string }> {
  const countries: Array<{ name: string; code: string }> = [];

  // Regex para extraer el nombre del país de cada tupla
  // Formato: ('uuid', 'timestamp', 'NombrePais')
  const tupleRegex = /\('[^']+',\s*'[^']+',\s*'([^']+)'\)/g;
  let match;

  while ((match = tupleRegex.exec(sqlContent)) !== null) {
    const name = match[1].trim();
    const code = countryCodeMap[name];
    if (code) {
      countries.push({ name, code });
    }
  }

  return countries;
}

function parseProvincesFromSQL(sqlContent: string): Array<{ id: number; name: string }> {
  const provinces: Array<{ id: number; name: string }> = [];

  // Regex para extraer id y nombre
  // Formato: ('1', 'timestamp', 'NombreProvincia')
  const tupleRegex = /\('(\d+)',\s*'[^']+',\s*'([^']+)'\)/g;
  let match;

  while ((match = tupleRegex.exec(sqlContent)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2].trim();
    provinces.push({ id, name });
  }

  return provinces;
}

function parseCitiesFromSQL(sqlContent: string): Array<{ provinceId: number; name: string }> {
  const cities: Array<{ provinceId: number; name: string }> = [];

  // Regex para extraer province_id y nombre
  // Formato: ('id', 'timestamp', 'province_id', 'NombreCiudad')
  const tupleRegex = /\('(\d+)',\s*'[^']+',\s*'(\d+)',\s*'([^']+)'\)/g;
  let match;

  while ((match = tupleRegex.exec(sqlContent)) !== null) {
    const provinceId = parseInt(match[2], 10);
    const name = match[3].trim();
    cities.push({ provinceId, name });
  }

  return cities;
}

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');
  const client = await pool.connect();

  try {
    // ============================================
    // 1. INSERTAR PAÍSES (desde archivo SQL)
    // ============================================
    console.log('📍 Insertando países...');

    const countriesSqlPath = path.join(__dirname, 'countries_rows.sql');
    let countriesInserted = 0;

    if (fs.existsSync(countriesSqlPath)) {
      const sqlContent = fs.readFileSync(countriesSqlPath, 'utf-8');
      const countries = parseCountriesFromSQL(sqlContent);

      console.log(`  📂 Encontrados ${countries.length} países en el archivo SQL`);

      for (const country of countries) {
        try {
          await client.query(
            `INSERT INTO countries (name, code, is_active, created_at, updated_at)
             VALUES ($1, $2, true, NOW(), NOW())
             ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
            [country.name, country.code]
          );
          countriesInserted++;
        } catch (err) {
          // Ignorar errores de duplicados
        }
      }
    } else {
      console.log('  ⚠️ Archivo countries_rows.sql no encontrado');
    }

    console.log(`  ✅ ${countriesInserted} países insertados/actualizados\n`);

    // ============================================
    // 2. INSERTAR PROVINCIAS (desde archivo SQL)
    // ============================================
    console.log('📍 Insertando provincias...');

    const provincesSqlPath = path.join(__dirname, 'provinces_rows.sql');
    let provincesInserted = 0;

    if (fs.existsSync(provincesSqlPath)) {
      const sqlContent = fs.readFileSync(provincesSqlPath, 'utf-8');
      const provinces = parseProvincesFromSQL(sqlContent);

      console.log(`  📂 Encontradas ${provinces.length} provincias en el archivo SQL`);

      // Insertar en orden de ID para mantener los IDs originales
      provinces.sort((a, b) => a.id - b.id);

      for (const province of provinces) {
        try {
          // Usar OVERRIDING SYSTEM VALUE para forzar el ID
          await client.query(
            `INSERT INTO provinces (id, name, is_active, created_at, updated_at)
             OVERRIDING SYSTEM VALUE
             VALUES ($1, $2, true, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
            [province.id, province.name]
          );
          provincesInserted++;
        } catch (err) {
          // Intentar sin OVERRIDING si falla
          try {
            await client.query(
              `INSERT INTO provinces (name, is_active, created_at, updated_at)
               VALUES ($1, true, NOW(), NOW())
               ON CONFLICT (name) DO NOTHING`,
              [province.name]
            );
            provincesInserted++;
          } catch {
            // Ignorar
          }
        }
      }

      // Actualizar secuencia para próximos inserts
      await client.query(`SELECT setval('provinces_id_seq', (SELECT MAX(id) FROM provinces))`);
    } else {
      console.log('  ⚠️ Archivo provinces_rows.sql no encontrado');
    }

    console.log(`  ✅ ${provincesInserted} provincias insertadas\n`);

    // ============================================
    // 3. INSERTAR CIUDADES (desde archivo SQL)
    // ============================================
    console.log('📍 Insertando ciudades...');

    const citiesSqlPath = path.join(__dirname, 'cities_rows.sql');

    if (fs.existsSync(citiesSqlPath)) {
      const sqlContent = fs.readFileSync(citiesSqlPath, 'utf-8');
      const cities = parseCitiesFromSQL(sqlContent);

      console.log(`  📂 Encontradas ${cities.length} ciudades en el archivo SQL`);

      let citiesInserted = 0;
      let citiesSkipped = 0;

      for (const city of cities) {
        try {
          await client.query(
            `INSERT INTO cities (name, province_id, is_active, created_at, updated_at)
             VALUES ($1, $2, true, NOW(), NOW())
             ON CONFLICT (name, province_id) DO NOTHING`,
            [city.name, city.provinceId]
          );
          citiesInserted++;
        } catch {
          citiesSkipped++;
        }
      }

      console.log(`  ✅ ${citiesInserted} ciudades insertadas`);
      if (citiesSkipped > 0) {
        console.log(`  ⚠️ ${citiesSkipped} ciudades omitidas (duplicados o errores)`);
      }
    } else {
      console.log('  ⚠️ Archivo cities_rows.sql no encontrado, omitiendo ciudades');
    }

    // ============================================
    // 4. CREAR EMPRESA DE PRUEBA
    // ============================================
    console.log('\n📍 Creando empresa de prueba...');

    const companyResult = await client.query(
      `INSERT INTO companies (id, name, slug, tax_id, description, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [
        'Empresa Demo S.A.',
        'empresa-demo',
        '30-12345678-9',
        'Empresa de demostración para desarrollo',
      ]
    );
    const COMPANY_ID = companyResult.rows[0].id;
    console.log(`  ✅ Empresa creada con ID: ${COMPANY_ID}`);

    // ============================================
    // 5. ASIGNAR USUARIO COMO OWNER DE LA EMPRESA
    // ============================================
    console.log('\n📍 Asignando usuario como owner...');

    await client.query(
      `INSERT INTO company_members (id, user_id, company_id, is_owner, is_active, joined_at, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, true, true, NOW(), NOW(), NOW())
       ON CONFLICT (company_id, user_id) DO UPDATE SET is_owner = true, is_active = true`,
      [OWNER_USER_ID, COMPANY_ID]
    );
    console.log(`  ✅ Usuario ${OWNER_USER_ID} asignado como owner`);

    // ============================================
    // 6. CREAR PREFERENCIAS DE USUARIO
    // ============================================
    console.log('\n📍 Creando preferencias de usuario...');

    await client.query(
      `INSERT INTO user_preferences (id, user_id, active_company_id, theme, locale, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'system', 'es', NOW())
       ON CONFLICT (user_id) DO UPDATE SET active_company_id = EXCLUDED.active_company_id`,
      [OWNER_USER_ID, COMPANY_ID]
    );
    console.log(`  ✅ Preferencias creadas con empresa activa`);

    // ============================================
    // 6.5 SISTEMA RBAC - ACCIONES Y ROLES
    // ============================================
    console.log('\n📍 Configurando sistema RBAC...');

    // 6.5.1 Crear acciones del sistema
    console.log('  🔑 Creando acciones del sistema...');
    const actions = [
      { slug: 'view', name: 'Ver', description: 'Permite ver/listar recursos' },
      { slug: 'create', name: 'Crear', description: 'Permite crear nuevos recursos' },
      { slug: 'update', name: 'Editar', description: 'Permite modificar recursos existentes' },
      { slug: 'delete', name: 'Eliminar', description: 'Permite eliminar recursos' },
    ];

    const actionIds: Record<string, string> = {};
    for (const action of actions) {
      const result = await client.query(
        `INSERT INTO actions (id, slug, name, description, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [action.slug, action.name, action.description]
      );
      actionIds[action.slug] = result.rows[0].id;
    }
    console.log(`    ✅ ${actions.length} acciones creadas`);

    // 6.5.2 Crear roles del sistema para la empresa
    console.log('  👥 Creando roles del sistema...');
    const systemRoles = [
      {
        slug: 'owner',
        name: 'Propietario',
        description: 'Acceso completo a todas las funcionalidades',
        color: '#7c3aed',
        isDefault: false,
      },
      {
        slug: 'developer',
        name: 'Desarrollador',
        description: 'Acceso completo para desarrollo y testing',
        color: '#059669',
        isDefault: false,
      },
      {
        slug: 'admin',
        name: 'Administrador',
        description: 'Acceso administrativo configurable',
        color: '#2563eb',
        isDefault: true,
      },
    ];

    const roleIds: Record<string, string> = {};
    for (const role of systemRoles) {
      const result = await client.query(
        `INSERT INTO company_roles (id, company_id, slug, name, description, color, is_system, is_default, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, $6, NOW(), NOW())
         ON CONFLICT (company_id, slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           color = EXCLUDED.color
         RETURNING id`,
        [COMPANY_ID, role.slug, role.name, role.description, role.color, role.isDefault]
      );
      roleIds[role.slug] = result.rows[0].id;
    }
    console.log(`    ✅ ${systemRoles.length} roles de sistema creados`);

    // 6.5.3 Asignar permisos completos a Owner y Developer
    console.log('  🔐 Asignando permisos a roles...');
    const allModules = [
      'dashboard',
      'employees',
      'equipment',
      'documents',
      'commercial.clients',
      'commercial.leads',
      'commercial.contacts',
      'commercial.quotes',
      'company.general.users',
      'company.general.roles',
      'company.general.audit',
      'company.documents',
      'company.cost-centers',
      'company.contract-types',
      'company.job-positions',
      'company.job-categories',
      'company.unions',
      'company.collective-agreements',
      'company.vehicle-brands',
      'company.vehicle-types',
      'company.equipment-owners',
      'company.sectors',
      'company.type-operatives',
      'company.contractors',
      'company.document-types',
    ];

    const actionSlugs = ['view', 'create', 'update', 'delete'];
    let permissionsCreated = 0;

    // Asignar todos los permisos a Owner y Developer
    for (const roleSlug of ['owner', 'developer']) {
      const roleId = roleIds[roleSlug];
      for (const module of allModules) {
        for (const actionSlug of actionSlugs) {
          const actionId = actionIds[actionSlug];
          await client.query(
            `INSERT INTO company_role_permissions (id, role_id, module, action_id, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, NOW())
             ON CONFLICT (role_id, module, action_id) DO NOTHING`,
            [roleId, module, actionId]
          );
          permissionsCreated++;
        }
      }
    }

    // Asignar permisos limitados a Admin (todos excepto company.general.roles delete y audit delete)
    const adminRoleId = roleIds['admin'];
    for (const module of allModules) {
      for (const actionSlug of actionSlugs) {
        // Restringir delete en roles y audit para Admin
        if ((module === 'company.general.roles' || module === 'company.general.audit') && actionSlug === 'delete') {
          continue;
        }
        const actionId = actionIds[actionSlug];
        await client.query(
          `INSERT INTO company_role_permissions (id, role_id, module, action_id, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           ON CONFLICT (role_id, module, action_id) DO NOTHING`,
          [adminRoleId, module, actionId]
        );
        permissionsCreated++;
      }
    }
    console.log(`    ✅ ${permissionsCreated} permisos asignados`);

    // 6.5.4 Asignar rol Owner al usuario
    console.log('  👤 Asignando rol al owner de la empresa...');
    await client.query(
      `UPDATE company_members
       SET role_id = $1
       WHERE company_id = $2 AND user_id = $3`,
      [roleIds['owner'], COMPANY_ID, OWNER_USER_ID]
    );
    console.log(`    ✅ Rol 'Propietario' asignado al usuario`);

    console.log('  ✅ Sistema RBAC configurado correctamente');

    // ============================================
    // 7. INSERTAR DATOS LABORALES
    // ============================================
    console.log('\n📍 Insertando datos laborales para empresa de prueba...');

    // 7.1 Tipos de Contrato
    console.log('  📋 Tipos de Contrato...');
    const contractTypes = [
      { name: 'Tiempo Indeterminado', code: '001' },
      { name: 'Plazo Fijo', code: '002' },
      { name: 'Período de Prueba', code: '003' },
      { name: 'Temporario', code: '004' },
      { name: 'Pasantía', code: '005' },
    ];
    for (const ct of contractTypes) {
      await client.query(
        `INSERT INTO contract_types (id, name, code, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [ct.name, ct.code, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${contractTypes.length} tipos de contrato`);

    // 7.2 Puestos de Trabajo
    console.log('  👔 Puestos de Trabajo...');
    const jobPositions = [
      'Gerente General',
      'Jefe de Operaciones',
      'Supervisor',
      'Chofer 1° Categoría',
      'Chofer 2° Categoría',
      'Administrativo',
      'Auxiliar Contable',
      'Recepcionista',
      'Personal de Limpieza',
      'Vigilante',
    ];
    for (const name of jobPositions) {
      await client.query(
        `INSERT INTO job_positions (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [name, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${jobPositions.length} puestos de trabajo`);

    // 7.3 Centros de Costo
    console.log('  💰 Centros de Costo...');
    const costCenters = [
      'Administración',
      'Operaciones',
      'Logística',
      'Mantenimiento',
      'Ventas',
      'Recursos Humanos',
    ];
    for (const name of costCenters) {
      await client.query(
        `INSERT INTO cost_centers (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [name, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${costCenters.length} centros de costo`);

    // 7.4 Sindicatos con Convenios y Categorías
    console.log('  🏛️ Sindicatos...');
    const unions = [
      { name: 'Camioneros', agreements: ['40/89', '644/12'] },
      { name: 'Comercio', agreements: ['130/75', '547/08'] },
      { name: 'UOCRA', agreements: ['76/75'] },
    ];

    for (const union of unions) {
      const unionResult = await client.query(
        `INSERT INTO unions (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [union.name, COMPANY_ID]
      );
      const unionId = unionResult.rows[0].id;

      for (const agreementName of union.agreements) {
        const agreementResult = await client.query(
          `INSERT INTO collective_agreements (id, name, union_id, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
           ON CONFLICT (union_id, name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [agreementName, unionId]
        );
        const agreementId = agreementResult.rows[0].id;

        const categories = [
          `${union.name} - Categoría 1`,
          `${union.name} - Categoría 2`,
          `${union.name} - Categoría 3`,
        ];
        for (const catName of categories) {
          await client.query(
            `INSERT INTO job_categories (id, name, agreement_id, is_active, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
             ON CONFLICT (agreement_id, name) DO NOTHING`,
            [catName, agreementId]
          );
        }
      }
    }
    console.log(`    ✅ ${unions.length} sindicatos con convenios y categorías`);

    console.log('\n  ✅ Datos laborales insertados correctamente');

    // ============================================
    // 8. INSERTAR DATOS DE VEHÍCULOS/EQUIPOS
    // ============================================
    console.log('\n📍 Insertando datos de vehículos/equipos para empresa de prueba...');

    // 8.1 Marcas de Vehículos con Modelos
    console.log('  🚛 Marcas y Modelos de Vehículos...');
    const vehicleBrands = [
      { name: 'Scania', models: ['R450', 'R500', 'G410', 'P360'] },
      { name: 'Volvo', models: ['FH 540', 'FH 460', 'FM 380', 'VM 330'] },
      { name: 'Mercedes-Benz', models: ['Actros 2651', 'Actros 2546', 'Atego 1726', 'Axor 2041'] },
      { name: 'Iveco', models: ['Stralis 570', 'Stralis 480', 'Tector 170E', 'Hi-Way 440'] },
      { name: 'MAN', models: ['TGX 29.440', 'TGS 26.360', 'TGM 15.250'] },
      { name: 'DAF', models: ['XF 530', 'CF 450', 'LF 260'] },
      { name: 'Ford', models: ['Cargo 1723', 'Cargo 1933', 'F-4000'] },
      { name: 'Volkswagen', models: ['Constellation 25.420', 'Delivery 11.180', 'Worker 17.230'] },
    ];

    for (const brand of vehicleBrands) {
      const brandResult = await client.query(
        `INSERT INTO vehicle_brands (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [brand.name, COMPANY_ID]
      );
      const brandId = brandResult.rows[0].id;

      for (const modelName of brand.models) {
        await client.query(
          `INSERT INTO vehicle_models (id, name, brand_id, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
           ON CONFLICT (brand_id, name) DO NOTHING`,
          [modelName, brandId]
        );
      }
    }
    console.log(`    ✅ ${vehicleBrands.length} marcas con sus modelos`);

    // 8.2 Tipos de Equipo
    console.log('  🚚 Tipos de Equipo...');
    const vehicleTypes = [
      { name: 'Camión', hasHitch: true, isTractorUnit: true },
      { name: 'Semirremolque', hasHitch: false, isTractorUnit: false },
      { name: 'Acoplado', hasHitch: false, isTractorUnit: false },
      { name: 'Camioneta', hasHitch: false, isTractorUnit: false },
      { name: 'Utilitario', hasHitch: false, isTractorUnit: false },
      { name: 'Tractor', hasHitch: true, isTractorUnit: true },
      { name: 'Cisterna', hasHitch: false, isTractorUnit: false },
      { name: 'Furgón', hasHitch: false, isTractorUnit: false },
    ];

    for (const vt of vehicleTypes) {
      await client.query(
        `INSERT INTO vehicle_types (id, name, has_hitch, is_tractor_unit, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [vt.name, vt.hasHitch, vt.isTractorUnit, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${vehicleTypes.length} tipos de equipo`);

    // 8.3 Tipos de Vehículo (Clasificación)
    console.log('  📦 Clasificación de Vehículos...');
    const typesOfVehicles = ['Vehículos', 'Otros Equipos', 'Maquinaria', 'Remolques'];

    for (const name of typesOfVehicles) {
      await client.query(
        `INSERT INTO types_of_vehicles (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [name, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${typesOfVehicles.length} clasificaciones de vehículos`);

    // 8.4 Sectores de Operación
    console.log('  🗺️ Sectores de Operación...');
    const sectors = [
      { name: 'Norte', description: 'Zona Norte del país' },
      { name: 'Sur', description: 'Zona Sur del país' },
      { name: 'Centro', description: 'Zona Centro del país' },
      { name: 'Litoral', description: 'Zona Litoral' },
      { name: 'Cuyo', description: 'Zona Cuyo' },
      { name: 'Patagonia', description: 'Zona Patagónica' },
    ];

    for (const sector of sectors) {
      await client.query(
        `INSERT INTO sectors (id, name, short_description, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [sector.name, sector.description, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${sectors.length} sectores de operación`);

    // 8.5 Tipos Operativos
    console.log('  ⚙️ Tipos Operativos...');
    const typeOperatives = [
      'Larga Distancia',
      'Distribución Urbana',
      'Regional',
      'Internacional',
      'Servicio Especial',
      'Transporte de Carga Peligrosa',
    ];

    for (const name of typeOperatives) {
      await client.query(
        `INSERT INTO type_operatives (id, name, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [name, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${typeOperatives.length} tipos operativos`);

    // 8.6 Contratistas/Clientes
    console.log('  🏢 Contratistas/Clientes...');
    const contractors = [
      {
        name: 'YPF S.A.',
        taxId: '30-54668997-9',
        email: 'logistica@ypf.com',
        phone: '0800-122-973',
      },
      {
        name: 'Petrolera Aconcagua',
        taxId: '30-70912456-8',
        email: 'contacto@petaconcagua.com',
        phone: '011-4555-1234',
      },
      {
        name: 'Pan American Energy',
        taxId: '30-68809517-3',
        email: 'operaciones@pan-energy.com',
        phone: '011-4321-5678',
      },
      {
        name: 'Tecpetrol',
        taxId: '30-59751875-2',
        email: 'transporte@tecpetrol.com',
        phone: '011-4800-1000',
      },
      {
        name: 'Total Austral',
        taxId: '30-50075628-5',
        email: 'logistica@total.com.ar',
        phone: '011-4319-4000',
      },
    ];

    for (const contractor of contractors) {
      await client.query(
        `INSERT INTO contractors (id, name, tax_id, email, phone, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
         ON CONFLICT (company_id, name) DO NOTHING`,
        [contractor.name, contractor.taxId, contractor.email, contractor.phone, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${contractors.length} contratistas/clientes`);

    // 8.7 Leads (prospectos)
    console.log('  📊 Leads...');
    const leads = [
      {
        name: 'Energía del Sur S.A.',
        taxId: '30-71234567-8',
        email: 'contacto@energiadelsur.com',
        phone: '011-4567-8901',
        status: 'NEW',
        notes: 'Interesados en servicios de transporte de combustible',
      },
      {
        name: 'Petroquímica Andina',
        taxId: '30-71345678-9',
        email: 'info@petroquimicaandina.com',
        phone: '011-4678-9012',
        status: 'CONTACTED',
        notes: 'Primera reunión realizada, esperando propuesta',
      },
      {
        name: 'Distribuidora Patagonia',
        taxId: '30-71456789-0',
        email: 'ventas@distpatagonia.com',
        phone: '0299-442-1234',
        status: 'NEGOTIATING',
        notes: 'Negociando tarifas para contrato anual',
      },
      {
        name: 'Combustibles del Norte',
        taxId: '30-71567890-1',
        email: 'operaciones@combnorte.com',
        phone: '0381-422-5678',
        status: 'NEW',
        notes: 'Contacto recibido por formulario web',
      },
    ];

    for (const lead of leads) {
      await client.query(
        `INSERT INTO leads (id, name, tax_id, email, phone, status, notes, company_id, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [lead.name, lead.taxId, lead.email, lead.phone, lead.status, lead.notes, COMPANY_ID]
      );
    }
    console.log(`    ✅ ${leads.length} leads`);

    // 8.8 Contactos
    console.log('  👤 Contactos...');

    // Obtener IDs de contractors para vincular contactos
    const contractorIds = await client.query(
      `SELECT id, name FROM contractors WHERE company_id = $1 LIMIT 3`,
      [COMPANY_ID]
    );

    // Obtener IDs de leads para vincular contactos
    const leadIds = await client.query(
      `SELECT id, name FROM leads WHERE company_id = $1 LIMIT 2`,
      [COMPANY_ID]
    );

    const contacts = [
      // Contactos vinculados a clientes
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'crodriguez@ypf.com',
        phone: '011-4555-0001',
        position: 'Gerente de Logística',
        contractorId: contractorIds.rows[0]?.id,
        leadId: null,
      },
      {
        firstName: 'María',
        lastName: 'González',
        email: 'mgonzalez@petaconcagua.com',
        phone: '011-4555-0002',
        position: 'Coordinadora de Operaciones',
        contractorId: contractorIds.rows[1]?.id,
        leadId: null,
      },
      {
        firstName: 'Roberto',
        lastName: 'Fernández',
        email: 'rfernandez@pan-energy.com',
        phone: '011-4555-0003',
        position: 'Director Comercial',
        contractorId: contractorIds.rows[2]?.id,
        leadId: null,
      },
      // Contactos vinculados a leads
      {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'amartinez@energiadelsur.com',
        phone: '011-4567-8902',
        position: 'Jefa de Compras',
        contractorId: null,
        leadId: leadIds.rows[0]?.id,
      },
      {
        firstName: 'Jorge',
        lastName: 'López',
        email: 'jlopez@petroquimicaandina.com',
        phone: '011-4678-9013',
        position: 'Gerente General',
        contractorId: null,
        leadId: leadIds.rows[1]?.id,
      },
      // Contactos sin vincular
      {
        firstName: 'Laura',
        lastName: 'Sánchez',
        email: 'lsanchez@gmail.com',
        phone: '011-4555-9999',
        position: 'Consultora',
        contractorId: null,
        leadId: null,
      },
    ];

    for (const contact of contacts) {
      if (contact.contractorId || contact.leadId || (!contact.contractorId && !contact.leadId)) {
        await client.query(
          `INSERT INTO contacts (id, first_name, last_name, email, phone, position, contractor_id, lead_id, company_id, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [
            contact.firstName,
            contact.lastName,
            contact.email,
            contact.phone,
            contact.position,
            contact.contractorId,
            contact.leadId,
            COMPANY_ID,
          ]
        );
      }
    }
    console.log(`    ✅ ${contacts.length} contactos`);

    console.log('\n  ✅ Datos de vehículos/equipos insertados correctamente');

    // ============================================
    // 9. INSERTAR EMPLEADOS DE EJEMPLO
    // ============================================
    console.log('\n📍 Insertando empleados de ejemplo...');

    // Obtener datos necesarios para empleados
    const argentinaResult = await client.query(
      `SELECT id FROM countries WHERE code = 'AR' LIMIT 1`
    );
    const argentinaId = argentinaResult.rows[0]?.id;

    const buenosAiresResult = await client.query(
      `SELECT id FROM provinces WHERE name = 'Buenos Aires' LIMIT 1`
    );
    const buenosAiresId = buenosAiresResult.rows[0]?.id;

    const cityResult = await client.query(`SELECT id FROM cities WHERE province_id = $1 LIMIT 1`, [
      buenosAiresId,
    ]);
    const cityId = cityResult.rows[0]?.id;

    const contractTypeResult = await client.query(
      `SELECT id FROM contract_types WHERE company_id = $1 AND name = 'Tiempo Indeterminado' LIMIT 1`,
      [COMPANY_ID]
    );
    const contractTypeId = contractTypeResult.rows[0]?.id;

    const jobPositionResult = await client.query(
      `SELECT id FROM job_positions WHERE company_id = $1 AND name = 'Chofer 1° Categoría' LIMIT 1`,
      [COMPANY_ID]
    );
    const jobPositionId = jobPositionResult.rows[0]?.id;

    const costCenterResult = await client.query(
      `SELECT id FROM cost_centers WHERE company_id = $1 AND name = 'Operaciones' LIMIT 1`,
      [COMPANY_ID]
    );
    const costCenterId = costCenterResult.rows[0]?.id;

    const employees = [
      {
        employeeNumber: '001',
        firstName: 'Juan',
        lastName: 'Pérez',
        documentNumber: '25123456',
        cuil: '20-25123456-7',
        gender: 'MALE',
        birthDate: '1985-03-15',
        hireDate: '2020-01-10',
        email: 'juan.perez@empresa.com',
        phone: '11-5555-1234',
      },
      {
        employeeNumber: '002',
        firstName: 'María',
        lastName: 'González',
        documentNumber: '28456789',
        cuil: '27-28456789-3',
        gender: 'FEMALE',
        birthDate: '1990-07-22',
        hireDate: '2021-03-01',
        email: 'maria.gonzalez@empresa.com',
        phone: '11-5555-5678',
      },
      {
        employeeNumber: '003',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        documentNumber: '30789012',
        cuil: '20-30789012-5',
        gender: 'MALE',
        birthDate: '1988-11-08',
        hireDate: '2019-06-15',
        email: 'carlos.rodriguez@empresa.com',
        phone: '11-5555-9012',
      },
    ];

    for (const emp of employees) {
      await client.query(
        `INSERT INTO employees (
          id, employee_number, first_name, last_name, document_number, cuil,
          identity_document_type, gender, birth_date, hire_date, email, phone,
          street, street_number,
          nationality_id, province_id, city_id, contract_type_id, job_position_id, cost_center_id,
          cost_type, union_affiliation_status, status, company_id, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5,
          'DNI', $6, $7, $8, $9, $10,
          'Av. Corrientes', '1234',
          $11, $12, $13, $14, $15, $16,
          'DIRECT', 'NOT_AFFILIATED', 'COMPLETE', $17, true, NOW(), NOW()
        ) ON CONFLICT (company_id, employee_number) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name`,
        [
          emp.employeeNumber,
          emp.firstName,
          emp.lastName,
          emp.documentNumber,
          emp.cuil,
          emp.gender,
          emp.birthDate,
          emp.hireDate,
          emp.email,
          emp.phone,
          argentinaId,
          buenosAiresId,
          cityId,
          contractTypeId,
          jobPositionId,
          costCenterId,
          COMPANY_ID,
        ]
      );
    }
    console.log(`  ✅ ${employees.length} empleados insertados`);

    // ============================================
    // 10. INSERTAR VEHÍCULOS DE EJEMPLO
    // ============================================
    console.log('\n📍 Insertando vehículos de ejemplo...');

    const vehicleBrandResult = await client.query(
      `SELECT id FROM vehicle_brands WHERE company_id = $1 AND name = 'Scania' LIMIT 1`,
      [COMPANY_ID]
    );
    const vehicleBrandId = vehicleBrandResult.rows[0]?.id;

    const vehicleModelResult = await client.query(
      `SELECT id FROM vehicle_models WHERE brand_id = $1 LIMIT 1`,
      [vehicleBrandId]
    );
    const vehicleModelId = vehicleModelResult.rows[0]?.id;

    const vehicleTypeResult = await client.query(
      `SELECT id FROM vehicle_types WHERE company_id = $1 AND name = 'Camión' LIMIT 1`,
      [COMPANY_ID]
    );
    const vehicleTypeId = vehicleTypeResult.rows[0]?.id;

    const typeOfVehicleResult = await client.query(
      `SELECT id FROM types_of_vehicles WHERE company_id = $1 AND name = 'Vehículos' LIMIT 1`,
      [COMPANY_ID]
    );
    const typeOfVehicleId = typeOfVehicleResult.rows[0]?.id;

    const vehicles = [
      {
        internNumber: '001',
        domain: 'AB123CD',
        engine: 'ENG001',
        chassis: 'CHS001',
        year: '2022',
      },
      {
        internNumber: '002',
        domain: 'EF456GH',
        engine: 'ENG002',
        chassis: 'CHS002',
        year: '2021',
      },
      {
        internNumber: '003',
        domain: 'IJ789KL',
        engine: 'ENG003',
        chassis: 'CHS003',
        year: '2023',
      },
    ];

    for (const v of vehicles) {
      await client.query(
        `INSERT INTO vehicles (
          id, intern_number, domain, engine, chassis, year,
          brand_id, model_id, type_id, type_of_vehicle_id,
          status, company_id, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          'COMPLETE', $10, true, NOW(), NOW()
        ) ON CONFLICT (company_id, domain) DO UPDATE SET
          intern_number = EXCLUDED.intern_number`,
        [
          v.internNumber,
          v.domain,
          v.engine,
          v.chassis,
          v.year,
          vehicleBrandId,
          vehicleModelId,
          vehicleTypeId,
          typeOfVehicleId,
          COMPANY_ID,
        ]
      );
    }
    console.log(`  ✅ ${vehicles.length} vehículos insertados`);

    // ============================================
    // 11. INSERTAR TIPOS DE DOCUMENTO
    // ============================================
    console.log('\n📍 Insertando tipos de documento...');

    // Helper para crear slug
    const slugify = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/Ñ/g, 'N')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Tipos de documento para EMPLEADOS
    const employeeDocTypes = [
      {
        name: 'DNI',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Licencia de Conducir',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'CUIL',
        isMandatory: true,
        hasExpiration: false,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Certificado de Antecedentes',
        isMandatory: false,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: true,
        isTermination: false,
      },
      {
        name: 'Recibo de Sueldo',
        isMandatory: false,
        hasExpiration: false,
        isMonthly: true,
        isPrivate: true,
        isTermination: false,
      },
      {
        name: 'Constancia de CBU',
        isMandatory: true,
        hasExpiration: false,
        isMonthly: false,
        isPrivate: true,
        isTermination: false,
      },
      {
        name: 'Certificado Médico',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: true,
        isTermination: false,
      },
    ];

    for (const dt of employeeDocTypes) {
      await client.query(
        `INSERT INTO document_types (
          id, name, slug, applies_to, is_mandatory, has_expiration, is_monthly, is_private, is_termination,
          company_id, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'EMPLOYEE', $3, $4, $5, $6, $7,
          $8, true, NOW(), NOW()
        ) ON CONFLICT (company_id, name) DO NOTHING`,
        [
          dt.name,
          slugify(dt.name),
          dt.isMandatory,
          dt.hasExpiration,
          dt.isMonthly,
          dt.isPrivate,
          dt.isTermination,
          COMPANY_ID,
        ]
      );
    }
    console.log(`  ✅ ${employeeDocTypes.length} tipos de documento para empleados`);

    // Tipos de documento para EQUIPOS
    const equipmentDocTypes = [
      {
        name: 'Cédula Verde',
        isMandatory: true,
        hasExpiration: false,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'VTV',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Seguro',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'RUTA',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Habilitación CNRT',
        isMandatory: false,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
    ];

    for (const dt of equipmentDocTypes) {
      await client.query(
        `INSERT INTO document_types (
          id, name, slug, applies_to, is_mandatory, has_expiration, is_monthly, is_private, is_termination,
          company_id, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'EQUIPMENT', $3, $4, $5, $6, $7,
          $8, true, NOW(), NOW()
        ) ON CONFLICT (company_id, name) DO NOTHING`,
        [
          dt.name,
          slugify(dt.name),
          dt.isMandatory,
          dt.hasExpiration,
          dt.isMonthly,
          dt.isPrivate,
          dt.isTermination,
          COMPANY_ID,
        ]
      );
    }
    console.log(`  ✅ ${equipmentDocTypes.length} tipos de documento para equipos`);

    // Tipos de documento para EMPRESA
    const companyDocTypes = [
      {
        name: 'F931',
        isMandatory: true,
        hasExpiration: false,
        isMonthly: true,
        isPrivate: true,
        isTermination: false,
      },
      {
        name: 'Constancia AFIP',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Habilitación Municipal',
        isMandatory: false,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
      {
        name: 'Póliza ART',
        isMandatory: true,
        hasExpiration: true,
        isMonthly: false,
        isPrivate: false,
        isTermination: false,
      },
    ];

    for (const dt of companyDocTypes) {
      await client.query(
        `INSERT INTO document_types (
          id, name, slug, applies_to, is_mandatory, has_expiration, is_monthly, is_private, is_termination,
          company_id, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'COMPANY', $3, $4, $5, $6, $7,
          $8, true, NOW(), NOW()
        ) ON CONFLICT (company_id, name) DO NOTHING`,
        [
          dt.name,
          slugify(dt.name),
          dt.isMandatory,
          dt.hasExpiration,
          dt.isMonthly,
          dt.isPrivate,
          dt.isTermination,
          COMPANY_ID,
        ]
      );
    }
    console.log(`  ✅ ${companyDocTypes.length} tipos de documento para empresa`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`\n📌 Resumen:`);
    console.log(`   - Empresa: Empresa Demo S.A. (${COMPANY_ID})`);
    console.log(`   - Owner: ${OWNER_USER_ID}`);
    console.log(`   - Empleados: ${employees.length}`);
    console.log(`   - Vehículos: ${vehicles.length}`);
    console.log(
      `   - Tipos de documento: ${employeeDocTypes.length + equipmentDocTypes.length + companyDocTypes.length}`
    );
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
