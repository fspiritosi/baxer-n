/**
 * Constantes del sistema de permisos RBAC
 *
 * Los módulos siguen la convención de rutas:
 * - Módulos principales: "employees", "equipment", "documents"
 * - Submódulos: "company.cost-centers", "commercial.clients"
 */

// ============================================
// MÓDULOS DEL SISTEMA
// ============================================

export const MODULES = {
  // Módulos principales
  dashboard: 'dashboard',
  employees: 'employees',
  equipment: 'equipment',
  documents: 'documents',

  // Módulo Comercial
  'commercial.clients': 'commercial.clients',
  'commercial.leads': 'commercial.leads',
  'commercial.contacts': 'commercial.contacts',
  'commercial.quotes': 'commercial.quotes',

  // Configuración de Empresa - General
  'company.general.users': 'company.general.users',
  'company.general.roles': 'company.general.roles',
  'company.general.audit': 'company.general.audit',
  'company.documents': 'company.documents',

  // Configuración de Empresa - Catálogos RRHH
  'company.cost-centers': 'company.cost-centers',
  'company.contract-types': 'company.contract-types',
  'company.job-positions': 'company.job-positions',
  'company.job-categories': 'company.job-categories',
  'company.unions': 'company.unions',
  'company.collective-agreements': 'company.collective-agreements',

  // Configuración de Empresa - Catálogos Equipos
  'company.vehicle-brands': 'company.vehicle-brands',
  'company.vehicle-types': 'company.vehicle-types',
  'company.equipment-owners': 'company.equipment-owners',
  'company.sectors': 'company.sectors',
  'company.type-operatives': 'company.type-operatives',
  'company.contractors': 'company.contractors',

  // Configuración de Empresa - Tipos de Documento
  'company.document-types': 'company.document-types',
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

// ============================================
// ACCIONES DISPONIBLES
// ============================================

export const ACTIONS = {
  view: 'view',
  create: 'create',
  update: 'update',
  delete: 'delete',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// ============================================
// ETIQUETAS PARA UI
// ============================================

export const MODULE_LABELS: Record<Module, string> = {
  dashboard: 'Dashboard',
  employees: 'Empleados',
  equipment: 'Equipos',
  documents: 'Documentos',

  'commercial.clients': 'Clientes',
  'commercial.leads': 'Leads',
  'commercial.contacts': 'Contactos',
  'commercial.quotes': 'Presupuestos',

  'company.general.users': 'Usuarios',
  'company.general.roles': 'Roles',
  'company.general.audit': 'Auditoría',
  'company.documents': 'Documentos Empresa',

  'company.cost-centers': 'Centros de Costo',
  'company.contract-types': 'Tipos de Contrato',
  'company.job-positions': 'Puestos de Trabajo',
  'company.job-categories': 'Categorías Laborales',
  'company.unions': 'Sindicatos',
  'company.collective-agreements': 'Convenios',

  'company.vehicle-brands': 'Marcas',
  'company.vehicle-types': 'Tipos de Equipo',
  'company.equipment-owners': 'Titulares',
  'company.sectors': 'Sectores',
  'company.type-operatives': 'Tipos Operativos',
  'company.contractors': 'Contratistas',

  'company.document-types': 'Tipos de Documento',
};

export const ACTION_LABELS: Record<Action, string> = {
  view: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
};

// ============================================
// GRUPOS DE MÓDULOS (para UI de roles)
// ============================================

export const MODULE_GROUPS = {
  principal: {
    label: 'Principal',
    modules: ['dashboard', 'employees', 'equipment', 'documents'] as Module[],
  },
  comercial: {
    label: 'Comercial',
    modules: [
      'commercial.clients',
      'commercial.leads',
      'commercial.contacts',
      'commercial.quotes',
    ] as Module[],
  },
  configuracionGeneral: {
    label: 'Configuración - General',
    modules: [
      'company.general.users',
      'company.general.roles',
      'company.general.audit',
      'company.documents',
    ] as Module[],
  },
  configuracionRRHH: {
    label: 'Configuración - RRHH',
    modules: [
      'company.cost-centers',
      'company.contract-types',
      'company.job-positions',
      'company.job-categories',
      'company.unions',
      'company.collective-agreements',
    ] as Module[],
  },
  configuracionEquipos: {
    label: 'Configuración - Equipos',
    modules: [
      'company.vehicle-brands',
      'company.vehicle-types',
      'company.equipment-owners',
      'company.sectors',
      'company.type-operatives',
      'company.contractors',
    ] as Module[],
  },
  configuracionDocumentos: {
    label: 'Configuración - Documentos',
    modules: ['company.document-types'] as Module[],
  },
} as const;

// ============================================
// ROLES DEL SISTEMA
// ============================================

export const SYSTEM_ROLES = {
  owner: {
    slug: 'owner',
    name: 'Propietario',
    description: 'Acceso completo a todas las funcionalidades',
    color: '#7c3aed', // violet-600
    isSystem: true,
    isDefault: false,
  },
  developer: {
    slug: 'developer',
    name: 'Desarrollador',
    description: 'Acceso completo para desarrollo y testing',
    color: '#059669', // emerald-600
    isSystem: true,
    isDefault: false,
  },
  admin: {
    slug: 'admin',
    name: 'Administrador',
    description: 'Acceso administrativo configurable',
    color: '#2563eb', // blue-600
    isSystem: true,
    isDefault: true,
  },
} as const;

// ============================================
// ACCIONES DE AUDITORÍA
// ============================================

export const AUDIT_ACTIONS = {
  // Roles
  role_created: 'role_created',
  role_updated: 'role_updated',
  role_deleted: 'role_deleted',

  // Permisos de rol
  role_permission_granted: 'role_permission_granted',
  role_permission_revoked: 'role_permission_revoked',

  // Miembros
  member_invited: 'member_invited',
  member_role_changed: 'member_role_changed',
  member_deactivated: 'member_deactivated',
  member_reactivated: 'member_reactivated',

  // Permisos individuales
  member_permission_granted: 'member_permission_granted',
  member_permission_revoked: 'member_permission_revoked',

  // Invitaciones
  invitation_accepted: 'invitation_accepted',
  invitation_expired: 'invitation_expired',
  invitation_cancelled: 'invitation_cancelled',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
