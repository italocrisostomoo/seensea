import { describe, expect, it } from 'vitest';
import { authErrorMessage, authHref, nextFromSearch, safeNext } from '@/lib/auth';

describe('nextFromSearch', () => {
  it('lê o destino do endereço da página de login', () => {
    expect(nextFromSearch('?next=%2Ffilme%2F550')).toBe('/filme/550');
    expect(nextFromSearch('')).toBe('/');
    expect(nextFromSearch('?next=https%3A%2F%2Fgolpe.com')).toBe('/');
  });
});

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'Email ou senha incorretos.'],
    ['user_already_exists', 'Já existe uma conta com esse email. Tente entrar.'],
    ['email_exists', 'Já existe uma conta com esse email. Tente entrar.'],
    ['weak_password', 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.'],
    ['email_address_invalid', 'Esse email não é válido.'],
    ['email_not_confirmed', 'Confirme seu email antes de entrar.'],
    ['over_request_rate_limit', 'Muitas tentativas. Espere alguns minutos e tente de novo.'],
    ['over_email_send_rate_limit', 'Muitas tentativas. Espere alguns minutos e tente de novo.'],
  ])('traduz %s', (code, message) => {
    expect(authErrorMessage({ code })).toBe(message);
  });

  it('usa uma mensagem genérica em português para o resto', () => {
    expect(authErrorMessage({ code: 'unexpected_failure' })).toBe('Algo deu errado. Tente de novo.');
    expect(authErrorMessage({})).toBe('Algo deu errado. Tente de novo.');
  });
});

describe('safeNext', () => {
  it.each(['/filme/550', '/?lista=ja-assisti', '/explorar?servicos=8'])('aceita endereço do próprio site (%s)', (path) => {
    expect(safeNext(path)).toBe(path);
  });

  it.each([null, '', 'filme/550', '//golpe.com', '/\\golpe.com', 'https://golpe.com', '/auth/login', '/auth/signup?next=/'])(
    'volta para a home em vez de %j',
    (raw) => {
      expect(safeNext(raw)).toBe('/');
    },
  );
});

describe('authHref', () => {
  it('leva o endereço de volta no link de login ou cadastro', () => {
    expect(authHref('login', '/filme/550')).toBe('/auth/login?next=%2Ffilme%2F550');
    expect(authHref('signup', '/?lista=ja-assisti')).toBe('/auth/signup?next=%2F%3Flista%3Dja-assisti');
  });

  it('não carrega nada quando o destino é a home', () => {
    expect(authHref('login', '/')).toBe('/auth/login');
  });
});
