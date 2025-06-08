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

interface NoteStore {
  // State
  categories: Category[];
  notes: Note[];
  isLoading: boolean;

  // Actions
  loadData: () => void;

  // Category actions
  createCategory: (data: CreateCategoryData) => void;
  updateCategory: (id: string, data: Partial<CreateCategoryData>) => void;
  deleteCategory: (id: string) => void;

  // Subcategory actions
  createSubcategory: (data: CreateSubcategoryData) => void;
  updateSubcategory: (id: string, data: Partial<CreateSubcategoryData>) => void;
  deleteSubcategory: (id: string) => void;

  // Note actions
  createNote: (data: CreateNoteData) => Note;
  updateNote: (id: string, data: UpdateNoteData) => void;
  deleteNote: (id: string) => void;
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

  // Load data from localStorage
  loadData: () => {
    set({ isLoading: true });
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
  },

  // Category actions
  createCategory: (data: CreateCategoryData) => {
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
  },

  updateCategory: (id: string, data: Partial<CreateCategoryData>) => {
    const categories = get().categories.map((cat) =>
      cat.id === id ? { ...cat, ...data } : cat,
    );
    set({ categories });
    storage.saveCategories(categories);
  },

  deleteCategory: (id: string) => {
    const { categories, notes } = get();

    // Get all subcategory IDs in this category
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    const subcategoryIds = category.subcategories.map((sub) => sub.id);

    // Remove notes in all subcategories of this category
    const filteredNotes = notes.filter(
      (note) => !subcategoryIds.includes(note.subcategoryId),
    );

    // Remove the category
    const filteredCategories = categories.filter((cat) => cat.id !== id);

    set({ categories: filteredCategories, notes: filteredNotes });
    storage.saveCategories(filteredCategories);
    storage.saveNotes(filteredNotes);
  },

  // Subcategory actions
  createSubcategory: (data: CreateSubcategoryData) => {
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
  },

  updateSubcategory: (id: string, data: Partial<CreateSubcategoryData>) => {
    const categories = get().categories.map((cat) => ({
      ...cat,
      subcategories: cat.subcategories.map((sub) =>
        sub.id === id ? { ...sub, ...data } : sub,
      ),
    }));

    set({ categories });
    storage.saveCategories(categories);
  },

  deleteSubcategory: (id: string) => {
    const { categories, notes } = get();

    // Remove notes in this subcategory
    const filteredNotes = notes.filter((note) => note.subcategoryId !== id);

    // Remove the subcategory
    const updatedCategories = categories.map((cat) => ({
      ...cat,
      subcategories: cat.subcategories.filter((sub) => sub.id !== id),
    }));

    set({ categories: updatedCategories, notes: filteredNotes });
    storage.saveCategories(updatedCategories);
    storage.saveNotes(filteredNotes);
  },

  // Note actions
  createNote: (data: CreateNoteData) => {
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
  },

  updateNote: (id: string, data: UpdateNoteData) => {
    const notes = get().notes.map((note) =>
      note.id === id ? { ...note, ...data, updatedAt: new Date() } : note,
    );

    set({ notes });
    storage.saveNotes(notes);
  },

  deleteNote: (id: string) => {
    const notes = get().notes.filter((note) => note.id !== id);
    set({ notes });
    storage.saveNotes(notes);
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
