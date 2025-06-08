import { create } from "zustand";
import { storage } from "@/lib/storage";

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  isLoading: boolean;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const AUTH_STORAGE_KEY = "noteapp_auth";

// Default credentials
const DEFAULT_CREDENTIALS = {
  username: "l3rokens",
  password: "10123012",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (username: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check credentials
    if (
      username === DEFAULT_CREDENTIALS.username &&
      password === DEFAULT_CREDENTIALS.password
    ) {
      const user = { username };

      // Store auth state
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, timestamp: Date.now() }),
      );

      set({
        isAuthenticated: true,
        user,
        isLoading: false,
      });

      return true;
    }

    return false;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  },

  checkAuth: () => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);

      if (authData) {
        const { user, timestamp } = JSON.parse(authData);

        // Check if auth is still valid (24 hours)
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

        if (isValid && user) {
          set({
            isAuthenticated: true,
            user,
            isLoading: false,
          });
          return;
        }
      }

      // No valid auth found
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking auth:", error);
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },
}));
