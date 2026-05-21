import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { AuthUser } from '../domain/auth-user.model';
import { authApiRepository } from '../infrastructure/auth-api.repository';
import { tokenStorage } from '../infrastructure/token-storage.service';
import { useCartStore } from '../../cart/application/cart.store';

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
  /** Refrescar perfil desde backend (p.ej. tras ganar MoonPoints) */
  refreshProfile: () => Promise<void>;
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
    } catch (err: unknown) {
      const message =
        isAxiosError(err) ? err.response?.data?.message : 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, lastName) => {
    set({ isLoading: true, error: null });
    try {
      await authApiRepository.register(email, password, name, lastName);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        isAxiosError(err) ? err.response?.data?.message : 'Error al registrarse';
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
      useCartStore.setState({ items: [], couponCode: null, discount: 0, couponError: null, error: null });
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

    // Si ya tenemos el usuario cacheado, mostrar inmediatamente y refrescar en background
    const cachedUser = tokenStorage.getUser();
    if (cachedUser) {
      set({
        user: cachedUser,
        isAuthenticated: true,
        isRestoring: false,
      });

      // Validar token Y actualizar datos frescos (puntos, nombre, etc.) en background
      try {
        const profile = await authApiRepository.getProfile();
        const fresh: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          lastName: profile.lastName,
          role: (profile.role as AuthUser['role']) ?? cachedUser.role,
          points: profile.points,
        };
        tokenStorage.saveUser(fresh);
        set({ user: fresh });
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
        role: profile.role ?? 'comprador',
        points: profile.points,
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

  refreshProfile: async () => {
    if (!tokenStorage.hasTokens()) return;
    try {
      const profile = await authApiRepository.getProfile();
      const current = tokenStorage.getUser();
      const merged: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        lastName: profile.lastName,
        role: profile.role ?? current?.role ?? 'comprador',
        points: profile.points,
      };
      tokenStorage.saveUser(merged);
      set({ user: merged });
    } catch {
      // Silencioso: no romper UX si falla
    }
  },

  clearError: () => set({ error: null }),
}));
