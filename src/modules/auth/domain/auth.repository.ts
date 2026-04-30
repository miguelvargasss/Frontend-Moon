import type { AuthUser } from './auth-user.model';

/** Respuesta del endpoint de login */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Respuesta del endpoint de registro */
export interface RegisterResponse {
  userId: string;
}

/** Contrato del repositorio de autenticación (Dependency Inversion) */
export interface IAuthRepository {
  login(email: string, password: string): Promise<LoginResponse>;
  register(
    email: string,
    password: string,
    name: string,
    lastName: string,
  ): Promise<RegisterResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
}
