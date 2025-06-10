import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging (remove in production)
console.log("🔧 Supabase Configuration Debug:");
console.log(
  "URL:",
  supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "undefined",
);
console.log(
  "Key:",
  supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "undefined",
);

// Validate that Supabase credentials are properly configured
const isSupabaseConfigured = () => {
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  const validUrl =
    supabaseUrl &&
    supabaseUrl.startsWith("https://") &&
    supabaseUrl.includes(".supabase.co");
  const validKey = supabaseAnonKey && supabaseAnonKey.length > 20;

  console.log("🔧 Configuration checks:", {
    hasUrl,
    hasKey,
    validUrl,
    validKey,
  });

  return hasUrl && hasKey && validUrl && validKey;
};

// Only create Supabase client if properly configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Export helper function to check if Supabase is available
export const isSupabaseAvailable = () => supabase !== null;

// Database schema types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          subcategory_id: string;
          tags: string[];
          images: string[];
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          subcategory_id: string;
          tags?: string[];
          images?: string[];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          subcategory_id?: string;
          tags?: string[];
          images?: string[];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
