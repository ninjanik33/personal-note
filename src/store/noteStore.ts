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
import { storage } from "@/lib/storage";
import { databaseAPI } from "@/lib/database";
import { createSampleData } from "@/lib/sampleData";
import { useAuthStore } from "./authStore";

interface NoteStore {
  // State
  categories: Category[];
  notes: Note[];
  isLoading: boolean;
  useDatabase: boolean; // Toggle between localStorage and database

  // Actions
  initialize: () => Promise<void>;
  loadData: () => Promise<void>;
  toggleDataSource: () => void;

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
  useDatabase: false, // Start with localStorage, will auto-switch to Supabase if available

  // Initialize the store and detect best data source
  initialize: async () => {
    // Check if Supabase is available and we have a user
    const { user } = useAuthStore.getState();
    const shouldUseDatabase = isSupabaseAvailable() && user;

    if (shouldUseDatabase && !get().useDatabase) {
      console.log(
        "🔄 Supabase detected and user logged in, switching to database mode",
      );
      set({ useDatabase: true });
    }

    await get().loadData();
  },

  toggleDataSource: () => {
    const currentUseDatabase = get().useDatabase;
    set({ useDatabase: !currentUseDatabase });
    get().loadData(); // Reload data from new source
  },

  // Load data from localStorage or database
  loadData: async () => {
    set({ isLoading: true });
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        // Load from database
        const { user } = useAuthStore.getState();
        if (!user) {
          console.warn("No user found, cannot load from database");
          set({ isLoading: false });
          return;
        }

        const [categories, notes] = await Promise.all([
          databaseAPI.getCategories(user.id),
          databaseAPI.getNotes(user.id),
        ]);

        set({ categories, notes, isLoading: false });
      } else {
        // Load from localStorage (existing logic)
        let categories = storage.getCategories();
        let notes = storage.getNotes();

        // If no data exists, create sample data
        if (categories.length === 0 && notes.length === 0) {
          const sampleData = createSampleData();
          categories = sampleData.categories;
          notes = sampleData.notes;
          storage.saveCategories(categories);
          storage.saveNotes(notes);
        }

        set({ categories, notes, isLoading: false });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      set({ isLoading: false });
    }
  },

  // Category actions
  createCategory: async (data: CreateCategoryData) => {
    const { useDatabase } = get();
    const { user } = useAuthStore.getState();

    try {
      if (useDatabase && user) {
        try {
          const newCategory = await databaseAPI.createCategory(
            user.id,
            data.name,
            data.color,
          );
          const categories = [...get().categories, newCategory];
          set({ categories });
          return;
        } catch (dbError) {
          console.warn(
            "Database operation failed, falling back to localStorage:",
            dbError,
          );
          // Fall back to localStorage if database fails
        }
      }

      // localStorage logic (fallback or default)
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        color: data.color,
        subcategories: [],
        createdAt: new Date(),
      };

      const categories = [...get().categories, newCategory];
      set({ categories });
      storage.saveCategories(categories);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.updateCategory(id, data);
      }

      // Update local state
      const categories = get().categories.map((cat) =>
        cat.id === id ? { ...cat, ...data } : cat,
      );
      set({ categories });

      if (!useDatabase) {
        storage.saveCategories(categories);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.deleteCategory(id);
      }

      const { categories, notes } = get();

      if (!useDatabase) {
        // localStorage logic (existing)
        const category = categories.find((cat) => cat.id === id);
        if (category) {
          const subcategoryIds = category.subcategories.map((sub) => sub.id);
          const filteredNotes = notes.filter(
            (note) => !subcategoryIds.includes(note.subcategoryId),
          );
          set({ notes: filteredNotes });
          storage.saveNotes(filteredNotes);
        }
      }

      // Remove the category from local state
      const filteredCategories = categories.filter((cat) => cat.id !== id);
      set({ categories: filteredCategories });

      if (!useDatabase) {
        storage.saveCategories(filteredCategories);
      } else {
        // Reload data to ensure consistency
        await get().loadData();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Subcategory actions
  createSubcategory: async (data: CreateSubcategoryData) => {
    const { useDatabase } = get();
    const { user } = useAuthStore.getState();

    try {
      if (useDatabase && user) {
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
      } else {
        // localStorage logic (existing)
        const newSubcategory: Subcategory = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          categoryId: data.categoryId,
          createdAt: new Date(),
        };

        const categories = get().categories.map((cat) =>
          cat.id === data.categoryId
            ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
            : cat,
        );

        set({ categories });
        storage.saveCategories(categories);
      }
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  updateSubcategory: async (
    id: string,
    data: Partial<CreateSubcategoryData>,
  ) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.updateSubcategory(id, data);
      }

      const categories = get().categories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) =>
          sub.id === id ? { ...sub, ...data } : sub,
        ),
      }));

      set({ categories });

      if (!useDatabase) {
        storage.saveCategories(categories);
      }
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  deleteSubcategory: async (id: string) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.deleteSubcategory(id);
      }

      const { categories, notes } = get();

      if (!useDatabase) {
        // Remove notes in this subcategory
        const filteredNotes = notes.filter((note) => note.subcategoryId !== id);
        set({ notes: filteredNotes });
        storage.saveNotes(filteredNotes);
      }

      // Remove the subcategory
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.filter((sub) => sub.id !== id),
      }));

      set({ categories: updatedCategories });

      if (!useDatabase) {
        storage.saveCategories(updatedCategories);
      } else {
        // Reload data to ensure consistency
        await get().loadData();
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },

  // Note actions
  createNote: async (data: CreateNoteData): Promise<Note> => {
    const { useDatabase } = get();
    const { user } = useAuthStore.getState();

    try {
      if (useDatabase && user) {
        const newNote = await databaseAPI.createNote(user.id, data);
        const notes = [...get().notes, newNote];
        set({ notes });
        return newNote;
      } else {
        // localStorage logic (existing)
        const newNote: Note = {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: data.title,
          content: data.content,
          subcategoryId: data.subcategoryId,
          tags: data.tags || [],
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const notes = [...get().notes, newNote];
        set({ notes });
        storage.saveNotes(notes);
        return newNote;
      }
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  updateNote: async (id: string, data: UpdateNoteData) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.updateNote(id, data);
      }

      const notes = get().notes.map((note) =>
        note.id === id ? { ...note, ...data, updatedAt: new Date() } : note,
      );

      set({ notes });

      if (!useDatabase) {
        storage.saveNotes(notes);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    const { useDatabase } = get();

    try {
      if (useDatabase) {
        await databaseAPI.deleteNote(id);
      }

      const notes = get().notes.filter((note) => note.id !== id);
      set({ notes });

      if (!useDatabase) {
        storage.saveNotes(notes);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  // Query functions (unchanged)
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
