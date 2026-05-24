import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { api } from '../api/client';
import { useDesignStore } from './designStore';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearError: () => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      // Ignore — first launch or corrupt data
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        const { user, token } = response.data;
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Reset design store on login to prevent image persistence between users
        useDesignStore.getState().reset();
        // Load credits for new session
        setTimeout(() => useDesignStore.getState().loadCredits(), 500);
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(email, username, password);
      if (response.success && response.data) {
        const { user, token } = response.data;
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Reset design store on register to prevent image persistence
        useDesignStore.getState().reset();
        // Load credits for new user (starts with 3 free credits from backend)
        setTimeout(() => useDesignStore.getState().loadCredits(), 500);
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    // Reset design store on logout to clear all data for next user
    useDesignStore.getState().reset();
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setAuth: (user: User, token: string) => {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
