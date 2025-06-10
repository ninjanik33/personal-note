import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { userProfileAPI } from "@/lib/userProfileAPI";

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; id: string; accountStatus?: string } | null;
  isLoading: boolean;

  // Actions
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; status?: string; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      if (!supabase) {
        return {
          success: false,
          message:
            "Supabase is not configured. Please check your environment variables.",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Auth error:", error);
        return {
          success: false,
          message: error.message || "Invalid email or password",
        };
      }

      if (data.user) {
        // Check user profile and account status
        try {
          const profile = await userProfileAPI.getUserProfile(data.user.id);

          if (profile.account_status !== "approved") {
            // User account is not approved yet
            await supabase.auth.signOut();
            return { success: false, status: profile.account_status };
          }

          const user = {
            username: profile.username || data.user.email || email,
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
          // If profile doesn't exist, create one or use basic info
          const user = {
            username: data.user.email || email,
            id: data.user.id,
            accountStatus: "approved",
          };

          set({
            isAuthenticated: true,
            user,
            isLoading: false,
          });

          return { success: true };
        }
      }

      return { success: false, message: "Authentication failed" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login. Please try again.",
      };
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      if (!supabase) {
        return {
          success: false,
          message:
            "Supabase is not configured. Please check your environment variables.",
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return {
          success: false,
          message: error.message,
        };
      }

      if (data.user) {
        // Create user profile
        try {
          await userProfileAPI.createUserProfile({
            user_id: data.user.id,
            username: username,
            email: email,
            account_status: "pending", // Default to pending approval
          });
        } catch (profileError) {
          console.warn("Error creating user profile:", profileError);
        }

        return {
          success: true,
          message:
            "Account created successfully! Please check your email to verify your account.",
        };
      }

      return { success: false, message: "Failed to create account" };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: "An error occurred during registration. Please try again.",
      };
    }
  },

  logout: async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }

      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if signOut fails
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    try {
      if (!supabase) {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile for additional info
        try {
          const profile = await userProfileAPI.getUserProfile(session.user.id);

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
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
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
