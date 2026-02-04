/**
 * Database utilities for Cypress tests
 * These functions are used to clean up test data after tests run
 */

import pg from 'pg';

const { Pool } = pg;

// Create a pool connection - will be initialized lazily
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

/**
 * Clean up test document types created during tests
 * Deletes document types that start with "Test" or contain timestamp patterns
 */
export async function cleanupTestDocumentTypes(companyId: string): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `DELETE FROM document_types
       WHERE company_id = $1
       AND (name LIKE 'Test %' OR name LIKE '%Doc Type%' OR name LIKE 'Expiring Doc%' OR name LIKE 'Monthly Doc%')
       RETURNING id`,
      [companyId]
    );
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

/**
 * Clean up test employee documents
 */
export async function cleanupTestEmployeeDocuments(companyId: string): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `DELETE FROM employee_documents
       WHERE employee_id IN (
         SELECT id FROM employees WHERE company_id = $1
       )
       AND rejection_reason LIKE '%test%'
       RETURNING id`,
      [companyId]
    );
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

/**
 * Clean up test equipment documents
 */
export async function cleanupTestEquipmentDocuments(companyId: string): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `DELETE FROM equipment_documents
       WHERE vehicle_id IN (
         SELECT id FROM vehicles WHERE company_id = $1
       )
       AND rejection_reason LIKE '%test%'
       RETURNING id`,
      [companyId]
    );
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

/**
 * Clean up test company documents
 */
export async function cleanupTestCompanyDocuments(companyId: string): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `DELETE FROM company_documents
       WHERE company_id = $1
       AND rejection_reason LIKE '%test%'
       RETURNING id`,
      [companyId]
    );
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

/**
 * Get the company ID for the test user
 */
export async function getTestCompanyId(userId: string): Promise<string | null> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT up.active_company_id
       FROM user_preferences up
       WHERE up.user_id = $1`,
      [userId]
    );
    return result.rows[0]?.active_company_id || null;
  } finally {
    client.release();
  }
}

/**
 * Clean up all test data for a company
 */
export async function cleanupAllTestData(companyId: string): Promise<{
  documentTypes: number;
  employeeDocs: number;
  equipmentDocs: number;
  companyDocs: number;
}> {
  const documentTypes = await cleanupTestDocumentTypes(companyId);
  const employeeDocs = await cleanupTestEmployeeDocuments(companyId);
  const equipmentDocs = await cleanupTestEquipmentDocuments(companyId);
  const companyDocs = await cleanupTestCompanyDocuments(companyId);

  return {
    documentTypes,
    employeeDocs,
    equipmentDocs,
    companyDocs,
  };
}

/**
 * Close the database pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
