import {
  randomBytes,
  scrypt as scryptCb,
  type ScryptOptions,
  timingSafeEqual,
} from 'node:crypto';

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  const { promise, resolve, reject } = Promise.withResolvers<Buffer>();
  scryptCb(password, salt, keylen, options, (err, derivedKey) => {
    if (err) reject(err);
    else resolve(derivedKey);
  });
  return promise;
}

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: MAXMEM,
  });

  return `scrypt$${N}$${R}$${P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

    const n = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = Buffer.from(parts[4], 'hex');
    const expectedKey = Buffer.from(parts[5], 'hex');

    if (!n || !r || !p || salt.length === 0 || expectedKey.length === 0) {
      return false;
    }

    const derivedKey = await scryptAsync(password, salt, expectedKey.length, {
      N: n,
      r,
      p,
      maxmem: MAXMEM,
    });

    if (derivedKey.length !== expectedKey.length) return false;
    return timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}
