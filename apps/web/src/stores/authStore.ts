import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localDB } from '../lib/localDB';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (!user.id.startsWith('mock-')) {
          localDB.auth.setCurrentUserId(user.id);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localDB.auth.setCurrentUserId(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      initFromStorage: async () => {
        const stored = get();
        if (stored.user && stored.token && !stored.user.id.startsWith('mock-')) {
          localDB.auth.setCurrentUserId(stored.user.id);
        }
      },
    }),
    {
      name: 'meos-auth',
    }
  )
);
