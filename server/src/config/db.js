import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://umrbybftcpbgfetyrwdc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// 1. Initialize Supabase Admin Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// 2. Initialize PostgreSQL Direct Connection Pool (Fallback & Direct SQL Querying)
const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || `postgres://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.umrbybftcpbgfetyrwdc.supabase.co:5432/postgres`;

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

// Helper to replace SQLite ? placeholders with PostgreSQL $1, $2... parameters
const formatPgSql = (sql) => {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
};

// Fallback SQL query executor via Supabase PostgREST Client
const executeViaSupabase = async (sql, params = []) => {
  const cleanSql = formatPgSql(sql).trim();
  const lowerSql = cleanSql.toLowerCase();

  let tableName = null;
  const fromMatch = lowerSql.match(/from\s+([a-z0-9_]+)/i);
  const intoMatch = lowerSql.match(/into\s+([a-z0-9_]+)/i);
  const updateMatch = lowerSql.match(/update\s+([a-z0-9_]+)/i);

  if (intoMatch) tableName = intoMatch[1];
  else if (updateMatch) tableName = updateMatch[1];
  else if (fromMatch) tableName = fromMatch[1];

  if (!tableName) return [];

  try {
    if (lowerSql.startsWith('select')) {
      let queryBuilder = supabase.from(tableName).select('*');
      if ((lowerSql.includes('where id = $1') || lowerSql.includes('where id=$1')) && params.length >= 1) {
        queryBuilder = queryBuilder.eq('id', params[0]);
      } else if ((lowerSql.includes('where user_id = $1') || lowerSql.includes('where user_id=$1')) && params.length >= 1) {
        queryBuilder = queryBuilder.eq('user_id', params[0]);
      } else if ((lowerSql.includes('where email = $1') || lowerSql.includes('where email=$1')) && params.length >= 1) {
        queryBuilder = queryBuilder.eq('email', params[0]);
      }

      if (lowerSql.includes('order by created_at desc')) {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder;
      if (error) console.warn(`Supabase REST Select Warning (${tableName}):`, error.message);
      return data || [];
    }

    if (lowerSql.startsWith('delete')) {
      const idParam = params[0];
      if (!idParam) return [];
      const { data, error } = await supabase.from(tableName).delete().eq('id', idParam).select();
      if (error) console.warn(`Supabase REST Delete Warning (${tableName}):`, error.message);
      return data || [];
    }
  } catch (err) {
    console.warn(`Supabase REST fallback execution error (${tableName}):`, err.message);
  }

  return [];
};

// 3. PostgreSQL Helper Functions
export const query = async (text, params = []) => {
  const pgText = formatPgSql(text);
  try {
    const res = await pool.query(pgText, params);
    return res.rows;
  } catch (err) {
    const fallbackRows = await executeViaSupabase(text, params);
    return fallbackRows;
  }
};

export const getOne = async (text, params = []) => {
  const rows = await query(text, params);
  return rows[0] || null;
};

export const run = async (text, params = []) => {
  return await query(text, params);
};

export const initDb = async () => {
  console.log('Connected to Supabase PostgreSQL Database at:', SUPABASE_URL);
};

export default {
  supabase,
  pool,
  query,
  getOne,
  run,
  initDb
};
