import { create } from 'zustand';

interface ToastStore {
  message: string;
  type: 'success' | 'warning' | 'error';
  isVisible: boolean;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  hideToast: () => void;
}

export const useStore = create<ToastStore>((set) => ({
  message: '',
  type: 'success',
  isVisible: false,
  showToast: (message, type = 'success') =>
    set({ message, type, isVisible: true }),
  hideToast: () => set({ isVisible: false }),
}));
