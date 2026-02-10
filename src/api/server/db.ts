import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Make database optional - app can work with LegiScan API only
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  // Configure pool for serverless environments
  // Smaller pool size and shorter timeouts for serverless functions
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  db = drizzle(pool, { schema });
} else {
  console.log('⚠️  DATABASE_URL not set - running in API-only mode with LegiScan');
}

export { pool, db };
export const isDatabaseConfigured = () => !!process.env.DATABASE_URL;
