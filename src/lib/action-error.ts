/**
 * Error whose message is safe to display to the admin. Other errors (DB, stack trace)
 * are never sent to the client; they are only logged on the server.
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
