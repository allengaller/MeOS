import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const mockUser: User = {
  id: 'mock-user-1',
  email: 'demo@meos.app',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
};

const mockToken = 'mock-token-for-development';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: mockUser,
      token: mockToken,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: mockUser, token: mockToken }),
    }),
    {
      name: 'meos-auth',
    }
  )
);
