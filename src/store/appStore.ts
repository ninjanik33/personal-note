import { create } from "zustand";
import { AppState } from "@/types/note";
import { storage } from "@/lib/storage";

interface AppStore extends AppState {
  // Actions
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedSubcategory: (subcategoryId: string | null) => void;
  setSelectedNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setLanguage: (language: "en" | "th" | "zh") => void;
  setTheme: (theme: "light" | "dark") => void;
  loadAppState: () => void;
  saveAppState: () => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  selectedNoteId: null,
  searchQuery: "",
  selectedTags: [],
  language: "en",
  theme: "light",

  // Actions
  setSelectedCategory: (categoryId: string | null) => {
    set({
      selectedCategoryId: categoryId,
      selectedSubcategoryId: null,
      selectedNoteId: null,
    });
    get().saveAppState();
  },

  setSelectedSubcategory: (subcategoryId: string | null) => {
    set({
      selectedSubcategoryId: subcategoryId,
      selectedNoteId: null,
    });
    get().saveAppState();
  },

  setSelectedNote: (noteId: string | null) => {
    set({ selectedNoteId: noteId });
    get().saveAppState();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedTags: (tags: string[]) => {
    set({ selectedTags: tags });
  },

  setLanguage: (language: "en" | "th" | "zh") => {
    set({ language });
    get().saveAppState();
  },

  setTheme: (theme: "light" | "dark") => {
    set({ theme });
    get().saveAppState();
  },

  loadAppState: () => {
    const savedState = storage.getAppState();
    set({ ...savedState });
  },

  saveAppState: () => {
    const state = get();
    storage.saveAppState({
      selectedCategoryId: state.selectedCategoryId,
      selectedSubcategoryId: state.selectedSubcategoryId,
      selectedNoteId: state.selectedNoteId,
      language: state.language,
      theme: state.theme,
    });
  },

  clearSelection: () => {
    set({
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedNoteId: null,
    });
    get().saveAppState();
  },
}));
