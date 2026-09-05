import { create } from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  email: null,
  setAuth: (token, email) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vh_token', token);
      localStorage.setItem('vh_email', email);
    }
    set({ token, email });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vh_token');
      localStorage.removeItem('vh_email');
    }
    set({ token: null, email: null });
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      set({
        token: localStorage.getItem('vh_token'),
        email: localStorage.getItem('vh_email'),
      });
    }
  },
}));
