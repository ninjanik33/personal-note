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
      // First try Supabase if available
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: username, // Assuming username is email
            password: password,
          });

          if (error) {
            console.error("Auth error:", error);
            // Continue to fallback methods if Supabase fails
          } else if (data.user) {
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
              // Continue to fallback methods if profile fetch fails
            }
          }
        } catch (supabaseError) {
          console.error("Supabase login error:", supabaseError);
          // Continue to fallback methods if Supabase fails
        }
      }

      // Fallback: Try localStorage for registered users
      try {
        const existingUsers = JSON.parse(
          localStorage.getItem("noteapp_users") || "[]",
        );
        const user = existingUsers.find(
          (u: any) =>
            (u.email.toLowerCase() === username.toLowerCase() ||
              u.username.toLowerCase() === username.toLowerCase()) &&
            u.password === password,
        );

        if (user) {
          // Check user profile for account status
          const existingProfiles = JSON.parse(
            localStorage.getItem("noteapp_user_profiles") || "[]",
          );
          const profile = existingProfiles.find(
            (p: any) => p.user_id === user.id,
          );

          if (profile && profile.account_status !== "approved") {
            return { success: false, status: profile.account_status };
          }

          const authUser = {
            username: user.username,
            id: user.id,
            accountStatus: profile?.account_status || "approved",
          };

          // Store in localStorage for session
          localStorage.setItem(
            "noteapp_auth",
            JSON.stringify({
              user: authUser,
              timestamp: Date.now(),
            }),
          );

          set({
            isAuthenticated: true,
            user: authUser,
            isLoading: false,
          });

          return { success: true };
        }
      } catch (localStorageError) {
        console.warn("Error checking localStorage users:", localStorageError);
      }

      // Final fallback: Demo credentials (for development/demo purposes)
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
      // Sign out from Supabase if available
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (supabaseError) {
          console.warn("Error signing out from Supabase:", supabaseError);
        }
      }

      // Also clear localStorage session
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
      // First check Supabase session if available
      if (supabase) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Get user profile for additional info
            try {
              const profile = await userProfileAPI.getUserProfile(
                session.user.id,
              );

              const user = {
                username: profile.username || session.user.email || "User",
                id: session.user.id,
                accountStatus: profile.account_status,
              };

              set({
                isAuthenticated: true,
                user,
                isLoading: false,
              });
              return;
            } catch (profileError) {
              console.warn("Error fetching user profile:", profileError);
              // Use basic user info if profile fetch fails
              const user = {
                username: session.user.email || "User",
                id: session.user.id,
                accountStatus: "approved",
              };

              set({
                isAuthenticated: true,
                user,
                isLoading: false,
              });
              return;
            }
          }
        } catch (supabaseError) {
          console.warn("Error checking Supabase session:", supabaseError);
          // Continue to localStorage fallback
        }
      }

      // Fallback: check localStorage
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
