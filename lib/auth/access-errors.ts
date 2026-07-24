export class AuthenticationRequiredError extends Error {
  readonly status = 401;
  constructor(message = "Autenticação necessária.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export class AccessDeniedError extends Error {
  readonly status = 403;
  constructor(message = "Você não tem permissão para acessar este recurso.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export function isAccessError(error: unknown) {
  return (
    error instanceof AuthenticationRequiredError ||
    error instanceof AccessDeniedError
  );
}
