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
  /** Si la sesión está siendo restaurada al cargar la app */
  isRestoring: boolean;
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
  /** Restaurar la sesión al cargar la app (rehydrate user desde token) */
  restoreSession: () => Promise<void>;
  /** Limpiar error */
  clearError: () => void;
}

/**
 * Store global de autenticación con Zustand.
 * Maneja el estado del usuario, tokens, y operaciones de auth.
 *
 * Al inicializar:
 * - Rehydrata `user` desde localStorage si existe
 * - `isAuthenticated` se basa en si hay tokens
 * - `restoreSession()` valida el token con el backend
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: tokenStorage.getUser(),
  isAuthenticated: tokenStorage.hasTokens(),
  isLoading: false,
  isRestoring: tokenStorage.hasTokens() && !tokenStorage.getUser(),
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiRepository.login(email, password);

      // Guardar tokens y datos del usuario
      tokenStorage.save({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      tokenStorage.saveUser(response.user);

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

  /**
   * Restaura la sesión validando el token contra el backend.
   * Si el token es válido, mantiene los datos del usuario cacheados.
   * Si el token es inválido, limpia la sesión.
   */
  restoreSession: async () => {
    if (!tokenStorage.hasTokens()) {
      set({ isRestoring: false });
      return;
    }

    // Si ya tenemos el usuario cacheado, solo necesitamos validar el token
    const cachedUser = tokenStorage.getUser();
    if (cachedUser) {
      set({
        user: cachedUser,
        isAuthenticated: true,
        isRestoring: false,
      });

      // Validar token en background (sin bloquear la UI)
      try {
        await authApiRepository.getProfile();
      } catch {
        // Token expirado — limpiar sesión
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      }
      return;
    }

    // Sin cache, intentar obtener perfil del backend
    try {
      const profile = await authApiRepository.getProfile();
      // Mapear al formato AuthUser (profile no tiene 'role', solo roleId)
      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        lastName: profile.lastName,
        role: (profile as any).role ?? 'comprador',
      };
      tokenStorage.saveUser(user);
      set({
        user,
        isAuthenticated: true,
        isRestoring: false,
      });
    } catch {
      // Token inválido — limpiar todo
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false, isRestoring: false });
    }
  },

  clearError: () => set({ error: null }),
}));
