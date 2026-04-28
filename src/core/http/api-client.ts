import axios from 'axios';
import { ENV } from '../config/env.config';

/**
 * Cliente HTTP Axios preconfigurado para comunicarse con el backend MoonPhases.
 *
 * Features:
 * - Base URL configurada desde variables de entorno
 * - Interceptor de request: inyecta JWT automáticamente
 * - Interceptor de response: extrae data del ApiResponse wrapper
 * - Manejo de refresh token en caso de 401
 */
const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor: inyecta Bearer token ──────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mp_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: desenvuelve ApiResponse + refresh en 401 ─────
apiClient.interceptors.response.use(
  (response) => {
    // El backend envuelve todo en { success, data, message }
    // Retornamos la respuesta completa para que cada servicio decida qué extraer
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 y no es un retry, intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('mp_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${ENV.API_URL}/auth/refresh`, {
            refreshToken,
          });

          const newToken = data.data.accessToken;
          localStorage.setItem('mp_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return apiClient(originalRequest);
        } catch {
          // Refresh falló — limpiar tokens y redirigir a login
          localStorage.removeItem('mp_access_token');
          localStorage.removeItem('mp_refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
