/**
 * Database Client - Turso Connection
 *
 * Singleton pattern for database connection.
 * Uses Turso (hosted SQLite) with edge replication.
 *
 * Environment Variables Required:
 * - DATABASE_URL: libsql://[database].turso.io
 * - DATABASE_AUTH_TOKEN: [token]
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Environment validation
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (!DATABASE_AUTH_TOKEN) {
  throw new Error('DATABASE_AUTH_TOKEN environment variable is not set');
}

// Create Turso client
const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export types for convenience
export type Database = typeof db;
