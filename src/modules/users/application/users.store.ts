import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { AdminUserModel } from '../domain/user.model';
import { usersApi } from '../infrastructure/users-api.repository';

interface UsersState {
  users: AdminUserModel[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await usersApi.getAll();
      set({ users, isLoading: false });
    } catch (err: unknown) {
      set({
        error: isAxiosError(err)
          ? err.response?.data?.message
          : 'Error al cargar usuarios',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
