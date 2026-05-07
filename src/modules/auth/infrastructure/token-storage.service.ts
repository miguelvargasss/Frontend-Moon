import type { AuthTokens } from '../domain/auth-tokens.model';
import type { AuthUser } from '../domain/auth-user.model';

const ACCESS_KEY = 'mp_access_token';
const REFRESH_KEY = 'mp_refresh_token';
const USER_KEY = 'mp_user';

/**
 * Servicio de persistencia de tokens JWT y datos de usuario en localStorage.
 * Centraliza el acceso para facilitar migración a cookies HttpOnly u otro storage.
 */
export const tokenStorage = {
  /** Guarda ambos tokens */
  save(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },

  /** Guarda los datos del usuario */
  saveUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Obtiene los datos del usuario persistidos */
  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** Obtiene el access token */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },

  /** Obtiene el refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },

  /** Limpia todo (logout) */
  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Verifica si hay tokens guardados */
  hasTokens(): boolean {
    return !!localStorage.getItem(ACCESS_KEY);
  },
};
