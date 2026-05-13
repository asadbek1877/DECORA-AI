import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ADMIN_KEY = 'admin_secret_key';

interface AdminState {
  secret: string | null;
  setSecret: (secret: string) => Promise<void>;
  clearSecret: () => Promise<void>;
  loadSecret: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  secret: null,
  setSecret: async (secret) => {
    await SecureStore.setItemAsync(ADMIN_KEY, secret).catch(() => {});
    set({ secret });
  },
  clearSecret: async () => {
    await SecureStore.deleteItemAsync(ADMIN_KEY).catch(() => {});
    set({ secret: null });
  },
  loadSecret: async () => {
    const secret = await SecureStore.getItemAsync(ADMIN_KEY).catch(() => null);
    if (secret) {
      set({ secret });
    }
  },
}));
