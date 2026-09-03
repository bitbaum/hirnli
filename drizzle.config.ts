/**
 * Drizzle Kit Configuration
 *
 * Targets Hirnli's own PostgreSQL database (split out of evig's `revampit`
 * DB on 2026-09-02 — the platform must not live inside one customer's app).
 * All tables are prefixed with `fundraising_` in schema.ts.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './src/lib/db/auth-schema.ts'],
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
