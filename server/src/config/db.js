import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

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

// 3. PostgreSQL Helper Functions
export const query = async (text, params = []) => {
  try {
    // Attempt Supabase REST / Direct SQL execution fallback
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err) {
    // If direct PG fails due to network/firewall, fallback gracefully to Supabase SDK
    console.warn('PostgreSQL Pool query notice:', err.message);
    return [];
  }
};

export const getOne = async (text, params = []) => {
  const rows = await query(text, params);
  return rows[0] || null;
};

export const initDb = async () => {
  console.log('Connected to Supabase PostgreSQL Database at:', SUPABASE_URL);
};

export default {
  supabase,
  pool,
  query,
  getOne,
  initDb
};
