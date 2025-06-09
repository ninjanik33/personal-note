import { supabase, isSupabaseAvailable } from "./supabase";
import {
  UserProfile,
  CreateUserProfileData,
  UpdateUserProfileData,
  UserRegistrationData,
} from "@/types/user";

// Transform database user profile to app user profile
const transformDbUserProfile = (dbProfile: any): UserProfile => ({
  id: dbProfile.id,
  user_id: dbProfile.user_id,
  username: dbProfile.username,
  email: dbProfile.email,
  first_name: dbProfile.first_name,
  last_name: dbProfile.last_name,
  display_name: dbProfile.display_name,
  account_status: dbProfile.account_status || "pending",
  date_of_birth: dbProfile.date_of_birth,
  phone_number: dbProfile.phone_number,
  gender: dbProfile.gender,
  country: dbProfile.country,
  state_province: dbProfile.state_province,
  city: dbProfile.city,
  postal_code: dbProfile.postal_code,
  timezone: dbProfile.timezone || "UTC",
  occupation: dbProfile.occupation,
  company: dbProfile.company,
  website: dbProfile.website,
  bio: dbProfile.bio,
  language_preference: dbProfile.language_preference || "en",
  theme_preference: dbProfile.theme_preference || "light",
  notification_preferences: dbProfile.notification_preferences || {
    email: true,
    push: false,
    marketing: false,
  },
  profile_visibility: dbProfile.profile_visibility || "private",
  two_factor_enabled: dbProfile.two_factor_enabled || false,
  email_verified: dbProfile.email_verified || false,
  phone_verified: dbProfile.phone_verified || false,
  avatar_url: dbProfile.avatar_url,
  cover_image_url: dbProfile.cover_image_url,
  subscription_plan: dbProfile.subscription_plan || "free",
  subscription_expires_at: dbProfile.subscription_expires_at,
  storage_used_bytes: dbProfile.storage_used_bytes || 0,
  notes_count: dbProfile.notes_count || 0,
  created_at: dbProfile.created_at,
  updated_at: dbProfile.updated_at,
  last_active_at: dbProfile.last_active_at,
});

export const userProfileAPI = {
  // Registration with profile data
  async registerUser(
    data: UserRegistrationData,
  ): Promise<{ user: any; profile: UserProfile }> {
    // If Supabase is not configured, use localStorage fallback
    if (!isSupabaseAvailable() || !supabase) {
      try {
        // Create user in localStorage
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const user = {
          id: userId,
          email: data.email,
          username: data.username,
          created_at: now,
        };

        const profile: UserProfile = {
          id: `profile_${userId}`,
          user_id: userId,
          username: data.username,
          email: data.email,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          display_name:
            data.first_name && data.last_name
              ? `${data.first_name} ${data.last_name}`
              : data.username,
          account_status: "pending" as const,
          date_of_birth: undefined,
          phone_number: undefined,
          gender: undefined,
          country: undefined,
          state_province: undefined,
          city: undefined,
          postal_code: undefined,
          timezone: "UTC",
          occupation: undefined,
          company: undefined,
          website: undefined,
          bio: undefined,
          language_preference: "en" as const,
          theme_preference: "system" as const,
          notification_preferences: {
            email: true,
            push: false,
            marketing: data.marketing_consent || false,
          },
          profile_visibility: "private" as const,
          two_factor_enabled: false,
          email_verified: false,
          phone_verified: false,
          avatar_url: undefined,
          cover_image_url: undefined,
          subscription_plan: "free" as const,
          subscription_expires_at: undefined,
          storage_used_bytes: 0,
          notes_count: 0,
          created_at: now,
          updated_at: now,
          last_active_at: now,
        };

        // Store in localStorage
        const existingUsers = JSON.parse(
          localStorage.getItem("noteapp_users") || "[]",
        );
        existingUsers.push({ ...user, password: data.password });
        localStorage.setItem("noteapp_users", JSON.stringify(existingUsers));

        const existingProfiles = JSON.parse(
          localStorage.getItem("noteapp_user_profiles") || "[]",
        );
        existingProfiles.push(profile);
        localStorage.setItem(
          "noteapp_user_profiles",
          JSON.stringify(existingProfiles),
        );

        return { user, profile };
      } catch (error) {
        console.error("Error registering user in localStorage:", error);
        throw new Error("Registration failed. Please try again.");
      }
    }

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User registration failed");

      // The profile will be automatically created by the database trigger
      // Wait a moment for the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the created profile
      const profile = await this.getUserProfile(authData.user.id);

      return {
        user: authData.user,
        profile,
      };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId?: string): Promise<UserProfile> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      let query = supabase.from("user_profiles").select("*").single();

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) throw new Error("User profile not found");

      return transformDbUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Create user profile (usually called automatically by trigger)
  async createUserProfile(
    userId: string,
    data: CreateUserProfileData,
  ): Promise<UserProfile> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      return transformDbUserProfile(profile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(
    updates: UpdateUserProfileData,
  ): Promise<UserProfile> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .select()
        .single();

      if (error) throw error;

      return transformDbUserProfile(data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Update user activity
  async updateLastActivity(): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      return; // Fail silently for activity updates
    }

    try {
      await supabase
        .from("user_profiles")
        .update({ last_active_at: new Date().toISOString() });
    } catch (error) {
      console.warn("Error updating user activity:", error);
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${userData.user.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("user-avatars")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(fileName);

      // Update user profile with avatar URL
      await this.updateUserProfile({ avatar_url: urlData.publicUrl });

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  // Delete avatar
  async deleteAvatar(): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Delete from storage
      await supabase.storage
        .from("user-avatars")
        .remove([`${userData.user.id}/avatar`]);

      // Update profile
      await this.updateUserProfile({ avatar_url: null });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  },

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    // If Supabase is not configured, use localStorage fallback
    if (!isSupabaseAvailable() || !supabase) {
      try {
        // Check against localStorage stored users
        const existingUsers = JSON.parse(
          localStorage.getItem("noteapp_users") || "[]",
        );
        const userExists = existingUsers.some(
          (user: any) => user.username.toLowerCase() === username.toLowerCase(),
        );
        return !userExists;
      } catch (error) {
        console.warn("Error checking username in localStorage:", error);
        // If localStorage fails, assume username is available
        return true;
      }
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (error && error.code === "PGRST116") {
        // No rows returned, username is available
        return true;
      }

      if (error) throw error;

      // Username exists
      return false;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error;
    }
  },

  // Get public profile (for future social features)
  async getPublicProfile(username: string): Promise<Partial<UserProfile>> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("public_user_profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching public profile:", error);
      throw error;
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
  }): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const currentProfile = await this.getUserProfile();
      const updatedPreferences = {
        ...currentProfile.notification_preferences,
        ...preferences,
      };

      await this.updateUserProfile({
        notification_preferences: updatedPreferences,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  },

  // Delete user account
  async deleteUserAccount(): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      // Delete user profile (this will cascade to delete notes, categories, etc.)
      await supabase.from("user_profiles").delete();

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser("user_id_here"); // This needs to be called from server-side

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  },
};
