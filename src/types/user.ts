export interface UserProfile {
  id: string;
  user_id: string;

  // Basic Information
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;

  // Account Status
  account_status: "pending" | "approved" | "rejected";

  // Personal Information
  date_of_birth?: string;
  phone_number?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";

  // Location Information
  country?: string;
  state_province?: string;
  city?: string;
  postal_code?: string;
  timezone: string;

  // Professional Information
  occupation?: string;
  company?: string;
  website?: string;
  bio?: string;

  // Preferences
  language_preference: "en" | "th" | "zh";
  theme_preference: "light" | "dark" | "system";
  notification_preferences: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };

  // Privacy & Security
  profile_visibility: "public" | "private" | "friends";
  two_factor_enabled: boolean;
  email_verified: boolean;
  phone_verified: boolean;

  // Profile Media
  avatar_url?: string;
  cover_image_url?: string;

  // Subscription & Usage
  subscription_plan: "free" | "premium" | "enterprise";
  subscription_expires_at?: string;
  storage_used_bytes: number;
  notes_count: number;

  // Metadata
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface CreateUserProfileData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  date_of_birth?: string;
  phone_number?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  country?: string;
  state_province?: string;
  city?: string;
  postal_code?: string;
  occupation?: string;
  company?: string;
  website?: string;
  bio?: string;
  language_preference?: "en" | "th" | "zh";
  theme_preference?: "light" | "dark" | "system";
  profile_visibility?: "public" | "private" | "friends";
  account_status?: "pending" | "approved" | "rejected";
}

export interface UpdateUserProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  date_of_birth?: string;
  phone_number?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  country?: string;
  state_province?: string;
  city?: string;
  postal_code?: string;
  timezone?: string;
  occupation?: string;
  company?: string;
  website?: string;
  bio?: string;
  language_preference?: "en" | "th" | "zh";
  theme_preference?: "light" | "dark" | "system";
  notification_preferences?: {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
  };
  profile_visibility?: "public" | "private" | "friends";
  avatar_url?: string;
  cover_image_url?: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  first_name?: string;
  last_name?: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
}

export interface UserStats {
  total_users: number;
  active_users_30d: number;
  new_users_30d: number;
  premium_users: number;
  total_notes: number;
  total_storage_used: number;
}
