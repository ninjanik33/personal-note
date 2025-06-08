export interface Note {
  id: string;
  title: string;
  content: string;
  subcategoryId: string;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
  createdAt: Date;
}

export interface AppState {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTags: string[];
  language: "en" | "th" | "zh";
  theme: "light" | "dark";
}

export interface CreateCategoryData {
  name: string;
  color: string;
}

export interface CreateSubcategoryData {
  name: string;
  categoryId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  subcategoryId: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  images?: string[];
}
