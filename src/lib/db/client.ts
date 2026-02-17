/**
 * Database Client - Neon PostgreSQL Connection
 *
 * Uses the shared revampit Neon DB via HTTP (edge-compatible).
 * Tables are prefixed with `fundraising_` to avoid conflicts.
 *
 * Environment Variables Required:
 * - DATABASE_URL: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
