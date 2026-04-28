import type { AuthTokens } from '../domain/auth-tokens.model';

const ACCESS_KEY = 'mp_access_token';
const REFRESH_KEY = 'mp_refresh_token';

/**
 * Servicio de persistencia de tokens JWT en localStorage.
 * Centraliza el acceso para facilitar migración a cookies HttpOnly u otro storage.
 */
export const tokenStorage = {
  /** Guarda ambos tokens */
  save(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },

  /** Obtiene el access token */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },

  /** Obtiene el refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },

  /** Limpia ambos tokens (logout) */
  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  /** Verifica si hay tokens guardados */
  hasTokens(): boolean {
    return !!localStorage.getItem(ACCESS_KEY);
  },
};
