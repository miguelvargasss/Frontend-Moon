import { create } from 'zustand';
import type { AuthUser } from '../domain/auth-user.model';
import { authApiRepository } from '../infrastructure/auth-api.repository';
import { tokenStorage } from '../infrastructure/token-storage.service';

interface AuthState {
  /** Usuario autenticado actual */
  user: AuthUser | null;
  /** Si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Si hay una operación en curso */
  isLoading: boolean;
  /** Mensaje de error de la última operación */
  error: string | null;

  /** Iniciar sesión */
  login: (email: string, password: string) => Promise<void>;
  /** Registrar nuevo usuario */
  register: (
    email: string,
    password: string,
    name: string,
    lastName: string,
  ) => Promise<void>;
  /** Cerrar sesión */
  logout: () => Promise<void>;
  /** Limpiar error */
  clearError: () => void;
}

/**
 * Store global de autenticación con Zustand.
 * Maneja el estado del usuario, tokens, y operaciones de auth.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: tokenStorage.hasTokens(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiRepository.login(email, password);

      // Guardar tokens
      tokenStorage.save({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, lastName) => {
    set({ isLoading: true, error: null });
    try {
      await authApiRepository.register(email, password, name, lastName);
      set({ isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Error al registrarse';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApiRepository.logout();
    } catch {
      // Silenciar errores de logout — limpiamos tokens de todos modos
    } finally {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
