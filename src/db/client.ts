/**
 * db/client.ts — koneksi Postgres (Neon di produksi, Postgres lokal di dev).
 *
 * Dipakai oleh server code & scripts tsx. Jangan import `server-only` di sini.
 * prepare: false WAJIB untuk URL pooled (pgbouncer) milik Neon.
 */

import postgres, { type Sql } from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __mamiDb?: Db;
  __mamiSql?: Sql;
};

export function getDb(): Db {
  if (globalForDb.__mamiDb) return globalForDb.__mamiDb;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum di-set');

  const sql = postgres(url, { prepare: false, max: 5 });
  const db = drizzle(sql, { schema });

  globalForDb.__mamiSql = sql;
  globalForDb.__mamiDb = db;
  return db;
}

export async function closeDb(): Promise<void> {
  const sql = globalForDb.__mamiSql;
  globalForDb.__mamiSql = undefined;
  globalForDb.__mamiDb = undefined;
  if (sql) await sql.end();
}
