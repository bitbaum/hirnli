/**
 * Database Client - Neon PostgreSQL Connection
 *
 * Uses the shared revampit Neon DB via HTTP (edge-compatible).
 * Tables are prefixed with `fundraising_` to avoid conflicts.
 *
 * Lazy initialization: the connection is created on first use, not at import
 * time. This allows builds to succeed without DATABASE_URL (CI, static
 * generation) — the error only fires when a route actually handles a request.
 *
 * Environment Variables Required:
 * - DATABASE_URL: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Required for database operations.'
      );
    }
    _sql = neon(url);
    _db = drizzle(_sql, { schema });
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

type Database = typeof db;
