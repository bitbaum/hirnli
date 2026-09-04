/**
 * Shared script DB client — pg-backed `sql` tagged template.
 *
 * Drop-in replacement for the old `neon()` tagged-template client the pipeline
 * scripts used before the 2026-06 self-host migration (the Neon HTTP driver
 * cannot talk to plain Postgres). Same call-site API:
 *
 *   import { sql } from './lib/db';
 *   const rows = await sql`SELECT * FROM fundraising_foundations WHERE id = ${id}`;
 *
 * Connection: DATABASE_URL from .env.local. Against the production box, open a
 * tunnel first: ssh -L 15432:127.0.0.1:5432 root@bitbaum (see docs/DEPLOYMENT.md).
 *
 * `allowExitOnIdle` lets one-shot scripts exit naturally without pool.end().
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — configure .env.local (see docs/DEPLOYMENT.md)');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      allowExitOnIdle: true,
    });
  }
  return pool;
}

/** Tagged-template query: sql`SELECT ... ${value}` → Promise of rows. */
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const text = strings.reduce((acc, part, i) => (i === 0 ? part : `${acc}$${i}${part}`), '');
  const { rows } = await getPool().query(text, values);
  return rows as T[];
}

/**
 * Plain parameterised query, for statements whose column list is built at
 * runtime and so cannot be written as a single template literal.
 *
 * Same pool, same parameter binding as `sql`. The only caller that needs it is
 * the assessment upsert, which writes whichever subset of columns a patch
 * actually mentions.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const { rows } = await getPool().query(text, values);
  return rows as T[];
}

/** Type of the tagged-template client — for functions that take `sql` as a parameter. */
export type SqlClient = typeof sql;

/** Explicitly close the pool (only needed for long-lived scripts). */
export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = null;
}
