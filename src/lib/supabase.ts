import { createClient } from "@supabase/supabase-js";

// These would normally come from environment variables
// For demo purposes, you'll need to replace these with your actual Supabase project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
