import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// Use Supabase database if available, otherwise fall back to local DATABASE_URL
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
