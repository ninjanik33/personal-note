import { supabase } from "./supabase";
import { Category, Note, Subcategory } from "@/types/note";

// Helper function to transform database category to app category
const transformDbCategory = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  color: dbCategory.color,
  createdAt: new Date(dbCategory.created_at),
  subcategories: [], // Will be populated separately
});

// Helper function to transform database subcategory to app subcategory
const transformDbSubcategory = (dbSubcategory: any): Subcategory => ({
  id: dbSubcategory.id,
  name: dbSubcategory.name,
  categoryId: dbSubcategory.category_id,
  createdAt: new Date(dbSubcategory.created_at),
});

// Helper function to transform database note to app note
const transformDbNote = (dbNote: any): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  subcategoryId: dbNote.subcategory_id,
  tags: dbNote.tags || [],
  images: dbNote.images || [],
  createdAt: new Date(dbNote.created_at),
  updatedAt: new Date(dbNote.updated_at),
});

export const databaseAPI = {
  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      // Get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Get subcategories
      const { data: subcategoriesData, error: subcategoriesError } =
        await supabase
          .from("subcategories")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

      if (subcategoriesError) throw subcategoriesError;

      // Transform and combine data
      const categories = categoriesData?.map(transformDbCategory) || [];
      const subcategories =
        subcategoriesData?.map(transformDbSubcategory) || [];

      // Group subcategories by category
      categories.forEach((category) => {
        category.subcategories = subcategories.filter(
          (sub) => sub.categoryId === category.id,
        );
      });

      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async createCategory(
    userId: string,
    name: string,
    color: string,
  ): Promise<Category> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name,
          color,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return transformDbCategory(data);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(
    categoryId: string,
    updates: { name?: string; color?: string },
  ): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", categoryId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      // Delete notes in subcategories of this category
      const { data: subcategories } = await supabase
        .from("subcategories")
        .select("id")
        .eq("category_id", categoryId);

      if (subcategories) {
        const subcategoryIds = subcategories.map((sub) => sub.id);
        if (subcategoryIds.length > 0) {
          await supabase
            .from("notes")
            .delete()
            .in("subcategory_id", subcategoryIds);
        }
      }

      // Delete subcategories
      await supabase
        .from("subcategories")
        .delete()
        .eq("category_id", categoryId);

      // Delete category
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Subcategories
  async createSubcategory(
    userId: string,
    name: string,
    categoryId: string,
  ): Promise<Subcategory> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("subcategories")
        .insert({
          name,
          category_id: categoryId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return transformDbSubcategory(data);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  async updateSubcategory(
    subcategoryId: string,
    updates: { name?: string },
  ): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { error } = await supabase
        .from("subcategories")
        .update(updates)
        .eq("id", subcategoryId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      // Delete notes in this subcategory
      await supabase.from("notes").delete().eq("subcategory_id", subcategoryId);

      // Delete subcategory
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", subcategoryId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },

  // Notes
  async getNotes(userId: string): Promise<Note[]> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data?.map(transformDbNote) || [];
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  },

  async createNote(
    userId: string,
    note: {
      title: string;
      content: string;
      subcategoryId: string;
      tags?: string[];
    },
  ): Promise<Note> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          title: note.title,
          content: note.content,
          subcategory_id: note.subcategoryId,
          tags: note.tags || [],
          images: [],
          user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return transformDbNote(data);
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      tags?: string[];
      images?: string[];
    },
  ): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { error } = await supabase
        .from("notes")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  // Image storage (Supabase Storage)
  async uploadImage(file: File, userId: string): Promise<string> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from("note-images")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("note-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  async deleteImage(imagePath: string): Promise<void> {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables.",
      );
    }

    try {
      const { error } = await supabase.storage
        .from("note-images")
        .remove([imagePath]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },
};
