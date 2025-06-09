import { customAPI } from "./customAPI";
import { Category, Note, Subcategory } from "@/types/note";

// Custom database API integration for your PostgreSQL backend
export const customDatabaseAPI = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await customAPI.categories.getAll();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async createCategory(name: string, color: string): Promise<Category> {
    try {
      return await customAPI.categories.create(name, color);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(
    categoryId: string,
    updates: { name?: string; color?: string },
  ): Promise<void> {
    try {
      await customAPI.categories.update(categoryId, updates);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await customAPI.categories.delete(categoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Subcategories
  async createSubcategory(
    name: string,
    categoryId: string,
  ): Promise<Subcategory> {
    try {
      return await customAPI.subcategories.create(name, categoryId);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  async updateSubcategory(
    subcategoryId: string,
    updates: { name?: string },
  ): Promise<void> {
    try {
      await customAPI.subcategories.update(subcategoryId, updates);
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    try {
      await customAPI.subcategories.delete(subcategoryId);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    try {
      return await customAPI.notes.getAll();
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  },

  async createNote(note: {
    title: string;
    content: string;
    subcategoryId: string;
    tags?: string[];
  }): Promise<Note> {
    try {
      return await customAPI.notes.create(note);
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
    try {
      await customAPI.notes.update(noteId, updates);
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    try {
      await customAPI.notes.delete(noteId);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  // Image storage
  async uploadImage(file: File): Promise<string> {
    try {
      return await customAPI.files.uploadImage(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      await customAPI.files.deleteImage(imageUrl);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  // Search
  async searchNotes(query: string): Promise<Note[]> {
    try {
      const results = await customAPI.search.global(query, "notes");
      return results.notes;
    } catch (error) {
      console.error("Error searching notes:", error);
      throw error;
    }
  },

  async getAllTags(): Promise<string[]> {
    try {
      const tags = await customAPI.search.getTags();
      return tags.map((t) => t.tag);
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },
};
