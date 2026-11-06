/**
 * Error yang pesannya memang boleh tampil ke admin. Error lain (DB, stack trace)
 * tidak pernah dikirim ke klien; hanya dicatat di server.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

export function actionErrorMessage(err: unknown, fallback: string, scope: string): string {
  if (err instanceof UserFacingError) return err.message;
  console.error(`[${scope}]`, err);
  return fallback;
}
