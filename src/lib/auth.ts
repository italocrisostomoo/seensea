const GENERIC = 'Algo deu errado. Tente de novo.';
const RATE_LIMIT = 'Muitas tentativas. Espere alguns minutos e tente de novo.';
const ALREADY_EXISTS = 'Já existe uma conta com esse email. Tente entrar.';

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email ou senha incorretos.',
  user_already_exists: ALREADY_EXISTS,
  email_exists: ALREADY_EXISTS,
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.',
  email_address_invalid: 'Esse email não é válido.',
  email_not_confirmed: 'Confirme seu email antes de entrar.',
  over_request_rate_limit: RATE_LIMIT,
  over_email_send_rate_limit: RATE_LIMIT,
};

export function authErrorMessage(error: { code?: string }): string {
  return (error.code && MESSAGES[error.code]) || GENERIC;
}

// Só caminhos do próprio site: "//x.com" e "/\x.com" o navegador trata como outro site.
export function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/';
  if (raw.startsWith('/auth/')) return '/';
  return raw;
}

export function nextFromSearch(search: string): string {
  return safeNext(new URLSearchParams(search).get('next'));
}

export function authHref(page: 'login' | 'signup', next: string): string {
  const base = `/auth/${page}`;
  return next === '/' ? base : `${base}?next=${encodeURIComponent(next)}`;
}
