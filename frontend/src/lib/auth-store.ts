import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

export interface AuthUser {
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isAdmin: false,

      login: async (email: string, password: string) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || err?.message || 'Invalid email or password');
        }

        const data = await res.json();
        const user: AuthUser = {
          name: data.user?.name || data.name || email.split('@')[0],
          email: data.user?.email || data.email || email,
          role: data.user?.role || data.role || 'CUSTOMER',
        };
        const token = data.token || data.accessToken;

        set({
          token,
          user,
          isLoggedIn: true,
          isAdmin: user.role === 'ADMIN',
        });
      },

      register: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || err?.message || 'Registration failed');
        }

        const data = await res.json();
        const user: AuthUser = {
          name: data.user?.name || data.name || name,
          email: data.user?.email || data.email || email,
          role: data.user?.role || data.role || 'CUSTOMER',
        };
        const token = data.token || data.accessToken;

        set({
          token,
          user,
          isLoggedIn: true,
          isAdmin: user.role === 'ADMIN',
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isLoggedIn: false,
          isAdmin: false,
        });
      },

      getAuthHeaders: (): Record<string, string> => {
        const token = get().token;
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
      },
    }),
    {
      name: 'dhanunjaiah-auth',
    }
  )
);

/**
 * Standalone helper to read auth headers without hooks.
 * Safe for use inside api.ts or other non-component code.
 */
export function authHeaders(): Record<string, string> {
  const state = useAuthStore.getState();
  if (!state.token) return {};
  return { Authorization: `Bearer ${state.token}` };
}
