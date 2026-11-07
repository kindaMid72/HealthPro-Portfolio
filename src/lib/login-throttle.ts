import { createHash } from 'node:crypto';
import { and, eq, gt, inArray, lt, ne, or, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { loginAttempts } from '@/db/schema';

export const WINDOW_MINUTES = 15;
export const MAX_ATTEMPTS_PER_IP = 5;
export const MAX_ATTEMPTS_PER_ACCOUNT = 50;
const ACCOUNT_BUCKET = '*';
const WINDOW = sql.raw(`interval '${WINDOW_MINUTES} minutes'`);

// Single statement upsert: conflicting row locked by Postgres so count cannot be lost;
// fixed window resets count after expiration.
async function bump(accountKey: string, ip: string): Promise<number> {
  const expired = sql`${loginAttempts.windowStart} <= now() - ${WINDOW}`;
  const [row] = await getDb()
    .insert(loginAttempts)
    .values({ accountKey, ip, attempts: 1 })
    .onConflictDoUpdate({
      target: [loginAttempts.accountKey, loginAttempts.ip],
      set: {
        attempts: sql`CASE WHEN ${expired} THEN 1 ELSE ${loginAttempts.attempts} + 1 END`,
        windowStart: sql`CASE WHEN ${expired} THEN now() ELSE ${loginAttempts.windowStart} END`,
      },
    })
    .returning({ attempts: loginAttempts.attempts });
  if (!row) throw new Error('login throttle: upsert did not return a row');
  return row.attempts;
}

// Hash email to 1024 keys: rows bounded and email is never stored.
export function accountKeyFor(email: string): string {
  return 'a' + (createHash('sha256').update(email).digest().readUInt16BE(0) % 1024);
}

// Called BEFORE password verification. No refund: every attempt counts.
export async function reserveLoginAttempt(email: string, ip: string): Promise<boolean> {
  await getDb()
    .delete(loginAttempts)
    .where(lt(loginAttempts.windowStart, sql`now() - ${WINDOW}`));

  const key = accountKeyFor(email);
  const acct = await bump(key, ACCOUNT_BUCKET);
  if (acct > MAX_ATTEMPTS_PER_ACCOUNT) return false;

  // Checked after account bucket: flooding from multiple IPs capped at 50 rows per key.
  const perIp = await bump(key, ip);
  return perIp <= MAX_ATTEMPTS_PER_IP;
}

export async function clearLoginAttempts(email: string, ip: string): Promise<void> {
  await getDb()
    .delete(loginAttempts)
    .where(
      and(
        eq(loginAttempts.accountKey, accountKeyFor(email)),
        inArray(loginAttempts.ip, [ip, ACCOUNT_BUCKET]),
      ),
    );
}

export async function clearAllLoginAttempts(email: string): Promise<void> {
  await getDb().delete(loginAttempts).where(eq(loginAttempts.accountKey, accountKeyFor(email)));
}

export async function getLockedAccountKeys(): Promise<Set<string>> {
  const rows = await getDb()
    .select({ accountKey: loginAttempts.accountKey })
    .from(loginAttempts)
    .where(
      and(
        gt(loginAttempts.windowStart, sql`now() - ${WINDOW}`),
        or(
          and(
            eq(loginAttempts.ip, ACCOUNT_BUCKET),
            gt(loginAttempts.attempts, MAX_ATTEMPTS_PER_ACCOUNT),
          ),
          and(
            ne(loginAttempts.ip, ACCOUNT_BUCKET),
            gt(loginAttempts.attempts, MAX_ATTEMPTS_PER_IP),
          ),
        ),
      ),
    );
  return new Set(rows.map((r) => r.accountKey));
}
