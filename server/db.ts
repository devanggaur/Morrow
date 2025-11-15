import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// For local development, you can use a local PostgreSQL database
// For production, use Neon serverless PostgreSQL
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // Fallback to a mock/in-memory database for development without DB
  console.warn('No DATABASE_URL provided. Using in-memory storage. Data will not persist.');
  // We'll keep using the in-memory storage from storage.ts
}

export { db };
