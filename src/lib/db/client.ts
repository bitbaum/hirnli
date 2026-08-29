/**
 * Database Client - PostgreSQL Connection
 *
 * Uses the shared revampit Postgres DB via a `node-postgres` connection pool.
 * Tables are prefixed with `fundraising_` to avoid conflicts.
 *
 * Lazy initialization: the connection is created on first use, not at import
 * time. This allows builds to succeed without DATABASE_URL (CI, static
 * generation) — the error only fires when a route actually handles a request.
 *
 * Environment Variables Required:
 * - DATABASE_URL: postgresql://user:pass@host:5432/dbname
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set. Required for database operations.');
    }
    _db = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return _db;
}

// Proxy that lazily initializes the DB on first property access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === 'function' ? value.bind(realDb) : value;
  },
});

export type Database = typeof db;
