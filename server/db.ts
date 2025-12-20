import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool for serverless environments
// Smaller pool size and shorter timeouts for serverless functions
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
