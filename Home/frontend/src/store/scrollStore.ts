import { create } from 'zustand';

interface ScrollState {
  lastScrollY: number;
  isNavVisible: boolean;
  updateScroll: (currentY: number) => void;
  reset: () => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  lastScrollY: 0,
  isNavVisible: true,
  updateScroll: (currentY: number) =>
    set((state) => {
      // Hide nav when scrolling down, show when scrolling up
      const isDown = currentY > state.lastScrollY;
      const isNavVisible = !isDown || currentY < 50; // Show always at top
      return {
        lastScrollY: currentY,
        isNavVisible,
      };
    }),
  reset: () => set({ lastScrollY: 0, isNavVisible: true }),
}));
