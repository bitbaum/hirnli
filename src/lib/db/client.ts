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
const DATABASE_URL = process.env.DATABASE_URL || '';
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN || '';

// Create Turso client (will fail at runtime if env vars missing, but won't fail at build time)
const client = DATABASE_URL ? createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
}) : null;

// Create Drizzle instance with schema
export const db = client ? drizzle(client, { schema }) : null as any;

// Export types for convenience
export type Database = typeof db;
