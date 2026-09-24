import { create } from 'zustand';
import { authApi } from '../api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('fs_user')) || null,
  isAuthenticated: !!localStorage.getItem('fs_token'),
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem('fs_token', data.data.token);
      localStorage.setItem('fs_user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
      set({ user: null, isAuthenticated: false });
    }
  }
}));
