import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export interface AuthUser {
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setEmailVerified: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isAdmin: false,

      login: async (email: string, password: string) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // sends & receives httpOnly cookies
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || err?.message || 'Invalid email or password');
        }

        const data = await res.json();
        const user: AuthUser = {
          name: data.name || email.split('@')[0],
          email: data.email || email,
          role: data.role || 'CUSTOMER',
          emailVerified: data.emailVerified ?? true,
        };

        set({ user, isLoggedIn: true, isAdmin: user.role === 'ADMIN' });
      },

      register: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || err?.message || 'Registration failed');
        }

        // Don't log in — user must verify email first, then login
        await res.json();
      },

      setEmailVerified: () => {
        set((state) => ({
          user: state.user ? { ...state.user, emailVerified: true } : null,
        }));
      },

      logout: () => {
        // Clear httpOnly cookie via backend
        fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
        set({ user: null, isLoggedIn: false, isAdmin: false });
      },

      // No longer needed for httpOnly cookies — browser sends automatically
      // Kept for backward compatibility with direct fetch calls
      getAuthHeaders: (): Record<string, string> => ({}),
    }),
    {
      name: 'dhanunjaiah-auth',
    }
  )
);

/**
 * For httpOnly cookies, no manual headers needed.
 * Just use credentials: 'include' on fetch calls.
 */
export function authHeaders(): Record<string, string> {
  return {};
}

/**
 * Authenticated fetch — includes httpOnly cookie automatically.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, credentials: 'include' });
}
