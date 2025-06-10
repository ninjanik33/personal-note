import { create } from "zustand";
import {
  Category,
  Note,
  Subcategory,
  CreateCategoryData,
  CreateSubcategoryData,
  CreateNoteData,
  UpdateNoteData,
} from "@/types/note";
import { databaseAPI } from "@/lib/database";
import { useAuthStore } from "./authStore";

interface NoteStore {
  // State
  categories: Category[];
  notes: Note[];
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;

  // Category actions
  createCategory: (data: CreateCategoryData) => Promise<void>;
  updateCategory: (
    id: string,
    data: Partial<CreateCategoryData>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Subcategory actions
  createSubcategory: (data: CreateSubcategoryData) => Promise<void>;
  updateSubcategory: (
    id: string,
    data: Partial<CreateSubcategoryData>,
  ) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  // Note actions
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesBySubcategory: (subcategoryId: string) => Note[];
  getNotesByCategory: (categoryId: string) => Note[];
  searchNotes: (query: string, categoryId?: string) => Note[];
  getAllTags: () => string[];
  getNotesByTags: (tags: string[]) => Note[];
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  // Initial state
  categories: [],
  notes: [],
  isLoading: false,

  // Load data from Supabase
  loadData: async () => {
    set({ isLoading: true });

    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.warn("No user found, cannot load data from database");
        set({ categories: [], notes: [], isLoading: false });
        return;
      }

      const [categories, notes] = await Promise.all([
        databaseAPI.getCategories(user.id),
        databaseAPI.getNotes(user.id),
      ]);

      set({ categories, notes, isLoading: false });
    } catch (error) {
      console.error("Error loading data:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Category actions
  createCategory: async (data: CreateCategoryData) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const newCategory = await databaseAPI.createCategory(
        user.id,
        data.name,
        data.color,
      );
      const categories = [...get().categories, newCategory];
      set({ categories });
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    try {
      await databaseAPI.updateCategory(id, data);

      const categories = get().categories.map((cat) =>
        cat.id === id ? { ...cat, ...data } : cat,
      );
      set({ categories });
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await databaseAPI.deleteCategory(id);

      // Reload data to ensure consistency
      await get().loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Subcategory actions
  createSubcategory: async (data: CreateSubcategoryData) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const newSubcategory = await databaseAPI.createSubcategory(
        user.id,
        data.name,
        data.categoryId,
      );

      const categories = get().categories.map((cat) =>
        cat.id === data.categoryId
          ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
          : cat,
      );

      set({ categories });
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  updateSubcategory: async (
    id: string,
    data: Partial<CreateSubcategoryData>,
  ) => {
    try {
      await databaseAPI.updateSubcategory(id, data);

      const categories = get().categories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) =>
          sub.id === id ? { ...sub, ...data } : sub,
        ),
      }));

      set({ categories });
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  deleteSubcategory: async (id: string) => {
    try {
      await databaseAPI.deleteSubcategory(id);

      // Reload data to ensure consistency
      await get().loadData();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },

  // Note actions
  createNote: async (data: CreateNoteData): Promise<Note> => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const newNote = await databaseAPI.createNote(user.id, data);
      const notes = [...get().notes, newNote];
      set({ notes });
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  updateNote: async (id: string, data: UpdateNoteData) => {
    try {
      await databaseAPI.updateNote(id, data);

      const notes = get().notes.map((note) =>
        note.id === id ? { ...note, ...data, updatedAt: new Date() } : note,
      );

      set({ notes });
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    try {
      await databaseAPI.deleteNote(id);

      const notes = get().notes.filter((note) => note.id !== id);
      set({ notes });
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  // Query functions
  getNotesBySubcategory: (subcategoryId: string) => {
    return get().notes.filter((note) => note.subcategoryId === subcategoryId);
  },

  getNotesByCategory: (categoryId: string) => {
    const category = get().categories.find((cat) => cat.id === categoryId);
    if (!category) return [];

    const subcategoryIds = category.subcategories.map((sub) => sub.id);
    return get().notes.filter((note) =>
      subcategoryIds.includes(note.subcategoryId),
    );
  },

  searchNotes: (query: string, categoryId?: string) => {
    let notesToSearch = get().notes;

    if (categoryId) {
      notesToSearch = get().getNotesByCategory(categoryId);
    }

    const lowercaseQuery = query.toLowerCase();
    return notesToSearch.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  },

  getAllTags: () => {
    const allTags = get().notes.flatMap((note) => note.tags);
    return Array.from(new Set(allTags)).sort();
  },

  getNotesByTags: (tags: string[]) => {
    return get().notes.filter((note) =>
      tags.some((tag) => note.tags.includes(tag)),
    );
  },
}));
