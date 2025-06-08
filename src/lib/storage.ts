import { Category, Note, AppState } from "@/types/note";

const STORAGE_KEYS = {
  CATEGORIES: "noteapp_categories",
  NOTES: "noteapp_notes",
  APP_STATE: "noteapp_state",
} as const;

export const storage = {
  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return [];

      const categories = JSON.parse(data);
      return categories.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        subcategories: cat.subcategories.map((sub: any) => ({
          ...sub,
          createdAt: new Date(sub.createdAt),
        })),
      }));
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  },

  // Notes
  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return [];

      const notes = JSON.parse(data);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("Error loading notes:", error);
      return [];
    }
  },

  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  },

  // App State
  getAppState(): Partial<AppState> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!data) return {};

      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading app state:", error);
      return {};
    }
  },

  saveAppState(state: Partial<AppState>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  },

  // Image storage (base64)
  saveImage(imageId: string, imageData: string): void {
    try {
      localStorage.setItem(`noteapp_image_${imageId}`, imageData);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  },

  getImage(imageId: string): string | null {
    try {
      return localStorage.getItem(`noteapp_image_${imageId}`);
    } catch (error) {
      console.error("Error loading image:", error);
      return null;
    }
  },

  deleteImage(imageId: string): void {
    try {
      localStorage.removeItem(`noteapp_image_${imageId}`);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear images
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("noteapp_image_")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};
