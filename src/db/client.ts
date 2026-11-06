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

  const host = new URL(url).hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
  const sql = postgres(url, {
    prepare: false,
    max: 5,
    ssl:
      process.env.NODE_ENV === 'production' && !isLocal
        ? { rejectUnauthorized: true }
        : undefined,
  });
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
