import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { userProfileAPI } from "@/lib/userProfileAPI";

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; id: string; accountStatus?: string } | null;
  isLoading: boolean;

  // Actions
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; status?: string }>;
  logout: () => void;
  checkAuth: () => void;
  signUp: (username: string, password: string) => Promise<boolean>;
}

// Default credentials for demo (you can remove this in production)
const DEFAULT_CREDENTIALS = {
  username: "l3rokens",
  password: "10123012",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (username: string, password: string) => {
    try {
      // For demo purposes, check against default credentials first
      if (
        username === DEFAULT_CREDENTIALS.username &&
        password === DEFAULT_CREDENTIALS.password
      ) {
        // Create a demo user session
        const user = {
          username,
          id: "demo-user-id",
          accountStatus: "approved",
        };

        // Store in localStorage for demo
        localStorage.setItem(
          "noteapp_auth",
          JSON.stringify({
            user,
            timestamp: Date.now(),
          }),
        );

        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });

        return { success: true };
      }

      // For real Supabase authentication:
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, // Assuming username is email
        password: password,
      });

      if (error) {
        console.error("Auth error:", error);
        return { success: false };
      }

      if (data.user) {
        // Check user profile and account status
        try {
          const profile = await userProfileAPI.getUserProfile(data.user.id);

          if (profile.account_status !== "approved") {
            // User account is not approved yet
            await supabase.auth.signOut(); // Sign them out
            return { success: false, status: profile.account_status };
          }

          const user = {
            username: profile.username || data.user.email || username,
            id: data.user.id,
            accountStatus: profile.account_status,
          };

          set({
            isAuthenticated: true,
            user,
            isLoading: false,
          });

          return { success: true };
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          await supabase.auth.signOut();
          return { success: false };
        }
      }

      return { success: false };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  },

  signUp: async (username: string, password: string) => {
    try {
      // For real Supabase authentication:
      /*
      const { data, error } = await supabase.auth.signUp({
        email: username,
        password: password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      return true;
      */

      // For demo, just return false (sign up not implemented)
      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      return false;
    }
  },

  logout: async () => {
    try {
      // For real Supabase authentication:
      /*
      await supabase.auth.signOut();
      */

      // For demo:
      localStorage.removeItem("noteapp_auth");

      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  checkAuth: async () => {
    try {
      // For real Supabase authentication:
      /*
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user = {
          username: session.user.email || 'User',
          id: session.user.id
        };

        set({
          isAuthenticated: true,
          user,
          isLoading: false
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
      */

      // For demo, check localStorage:
      const authData = localStorage.getItem("noteapp_auth");

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
