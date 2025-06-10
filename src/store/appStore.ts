import { create } from "zustand";

interface AppState {
  // Selection state
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedNoteId: string | null;

  // Search and filter state
  searchQuery: string;
  selectedTags: string[];

  // UI state
  sidebarCollapsed: boolean;

  // Actions
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedSubcategory: (subcategoryId: string | null) => void;
  setSelectedNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleSidebar: () => void;
  loadAppState: () => void;
  saveAppState: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  selectedNoteId: null,
  searchQuery: "",
  selectedTags: [],
  sidebarCollapsed: false,

  // Selection actions
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

  // Search and filter actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().saveAppState();
  },

  setSelectedTags: (tags: string[]) => {
    set({ selectedTags: tags });
    get().saveAppState();
  },

  // UI actions
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
    get().saveAppState();
  },

  // State persistence (in-memory only, no localStorage)
  loadAppState: () => {
    // Keep default state - no persistent storage needed
    // Selection state will be reset on page refresh
  },

  saveAppState: () => {
    // No-op - we don't persist app state anymore
    // Selection state is transient and resets on page refresh
  },
}));
