import apiClient from '../../../core/http/api-client';
import type { IAuthRepository, LoginResponse, RegisterResponse } from '../domain/auth.repository';

/**
 * Implementación del repositorio de autenticación usando la API REST.
 * Se comunica con el backend NestJS vía Axios.
 */
export const authApiRepository: IAuthRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data.data; // Extrae del wrapper ApiResponse { success, data, message }
  },

  async register(
    email: string,
    password: string,
    name: string,
    lastName: string,
  ): Promise<RegisterResponse> {
    const { data } = await apiClient.post('/auth/register', {
      email,
      password,
      name,
      lastName,
    });
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data.data;
  },
};
