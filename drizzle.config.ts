/**
 * Drizzle Kit Configuration
 *
 * Targets the shared revampit Neon PostgreSQL database.
 * All tables are prefixed with `fundraising_` in schema.ts.
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
