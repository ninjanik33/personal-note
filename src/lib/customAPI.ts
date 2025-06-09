import { Category, Note, Subcategory } from "@/types/note";

// Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// API Response types
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Auth token management
class AuthManager {
  private static TOKEN_KEY = "noteapp_token";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// HTTP client with error handling
class HTTPClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...AuthManager.getAuthHeaders(),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  static async uploadFile<T>(
    endpoint: string,
    file: File,
  ): Promise<APIResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<T>(endpoint, {
      method: "POST",
      headers: AuthManager.getAuthHeaders(), // Don't set Content-Type for FormData
      body: formData,
    });
  }
}

// Transform functions between API and app formats
const transformDbCategory = (apiCategory: any): Category => ({
  id: apiCategory.id,
  name: apiCategory.name,
  color: apiCategory.color,
  createdAt: new Date(apiCategory.created_at),
  subcategories: (apiCategory.subcategories || []).map(transformDbSubcategory),
});

const transformDbSubcategory = (apiSubcategory: any): Subcategory => ({
  id: apiSubcategory.id,
  name: apiSubcategory.name,
  categoryId: apiSubcategory.category_id,
  createdAt: new Date(apiSubcategory.created_at),
});

const transformDbNote = (apiNote: any): Note => ({
  id: apiNote.id,
  title: apiNote.title,
  content: apiNote.content,
  subcategoryId: apiNote.subcategory_id,
  tags: apiNote.tags || [],
  images: apiNote.images || [],
  createdAt: new Date(apiNote.created_at),
  updatedAt: new Date(apiNote.updated_at),
});

// API client for the note-taking app
export const customAPI = {
  // Authentication
  auth: {
    async login(
      username: string,
      password: string,
    ): Promise<{ user: any; token: string }> {
      const response = await HTTPClient.post<{ user: any; token: string }>(
        "/auth/login",
        {
          username,
          password,
        },
      );

      if (response.success && response.data) {
        AuthManager.setToken(response.data.token);
        return response.data;
      }

      throw new Error(response.error || "Login failed");
    },

    async register(
      username: string,
      email: string,
      password: string,
    ): Promise<{ user: any; token: string }> {
      const response = await HTTPClient.post<{ user: any; token: string }>(
        "/auth/register",
        {
          username,
          email,
          password,
        },
      );

      if (response.success && response.data) {
        AuthManager.setToken(response.data.token);
        return response.data;
      }

      throw new Error(response.error || "Registration failed");
    },

    async logout(): Promise<void> {
      try {
        await HTTPClient.post("/auth/logout");
      } catch (error) {
        console.warn("Logout API call failed:", error);
      } finally {
        AuthManager.removeToken();
      }
    },

    async getMe(): Promise<any> {
      const response = await HTTPClient.get<{ user: any }>("/auth/me");

      if (response.success && response.data) {
        return response.data.user;
      }

      throw new Error(response.error || "Failed to get user info");
    },
  },

  // Categories
  categories: {
    async getAll(): Promise<Category[]> {
      const response = await HTTPClient.get<any[]>("/categories");

      if (response.success && response.data) {
        return response.data.map(transformDbCategory);
      }

      throw new Error(response.error || "Failed to fetch categories");
    },

    async create(name: string, color: string): Promise<Category> {
      const response = await HTTPClient.post<any>("/categories", {
        name,
        color,
      });

      if (response.success && response.data) {
        return transformDbCategory(response.data);
      }

      throw new Error(response.error || "Failed to create category");
    },

    async update(
      id: string,
      updates: { name?: string; color?: string },
    ): Promise<Category> {
      const response = await HTTPClient.put<any>(`/categories/${id}`, updates);

      if (response.success && response.data) {
        return transformDbCategory(response.data);
      }

      throw new Error(response.error || "Failed to update category");
    },

    async delete(id: string): Promise<void> {
      const response = await HTTPClient.delete(`/categories/${id}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete category");
      }
    },
  },

  // Subcategories
  subcategories: {
    async getAll(categoryId?: string): Promise<Subcategory[]> {
      const endpoint = categoryId
        ? `/subcategories?category_id=${categoryId}`
        : "/subcategories";
      const response = await HTTPClient.get<any[]>(endpoint);

      if (response.success && response.data) {
        return response.data.map(transformDbSubcategory);
      }

      throw new Error(response.error || "Failed to fetch subcategories");
    },

    async create(name: string, categoryId: string): Promise<Subcategory> {
      const response = await HTTPClient.post<any>("/subcategories", {
        name,
        category_id: categoryId,
      });

      if (response.success && response.data) {
        return transformDbSubcategory(response.data);
      }

      throw new Error(response.error || "Failed to create subcategory");
    },

    async update(id: string, updates: { name?: string }): Promise<Subcategory> {
      const response = await HTTPClient.put<any>(
        `/subcategories/${id}`,
        updates,
      );

      if (response.success && response.data) {
        return transformDbSubcategory(response.data);
      }

      throw new Error(response.error || "Failed to update subcategory");
    },

    async delete(id: string): Promise<void> {
      const response = await HTTPClient.delete(`/subcategories/${id}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete subcategory");
      }
    },
  },

  // Notes
  notes: {
    async getAll(
      options: {
        subcategoryId?: string;
        categoryId?: string;
        search?: string;
        tags?: string[];
        limit?: number;
        offset?: number;
      } = {},
    ): Promise<Note[]> {
      const params = new URLSearchParams();

      if (options.subcategoryId)
        params.append("subcategory_id", options.subcategoryId);
      if (options.categoryId) params.append("category_id", options.categoryId);
      if (options.search) params.append("search", options.search);
      if (options.tags && options.tags.length > 0)
        params.append("tags", options.tags.join(","));
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.offset) params.append("offset", options.offset.toString());

      const endpoint = `/notes${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await HTTPClient.get<any[]>(endpoint);

      if (response.success && response.data) {
        return response.data.map(transformDbNote);
      }

      throw new Error(response.error || "Failed to fetch notes");
    },

    async getById(id: string): Promise<Note> {
      const response = await HTTPClient.get<any>(`/notes/${id}`);

      if (response.success && response.data) {
        return transformDbNote(response.data);
      }

      throw new Error(response.error || "Failed to fetch note");
    },

    async create(data: {
      title: string;
      content: string;
      subcategoryId: string;
      tags?: string[];
      images?: string[];
    }): Promise<Note> {
      const response = await HTTPClient.post<any>("/notes", {
        title: data.title,
        content: data.content,
        subcategory_id: data.subcategoryId,
        tags: data.tags || [],
        images: data.images || [],
      });

      if (response.success && response.data) {
        return transformDbNote(response.data);
      }

      throw new Error(response.error || "Failed to create note");
    },

    async update(
      id: string,
      updates: {
        title?: string;
        content?: string;
        tags?: string[];
        images?: string[];
      },
    ): Promise<Note> {
      const response = await HTTPClient.put<any>(`/notes/${id}`, updates);

      if (response.success && response.data) {
        return transformDbNote(response.data);
      }

      throw new Error(response.error || "Failed to update note");
    },

    async delete(id: string): Promise<void> {
      const response = await HTTPClient.delete(`/notes/${id}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete note");
      }
    },
  },

  // File uploads
  files: {
    async uploadImage(file: File): Promise<string> {
      const response = await HTTPClient.uploadFile<{ url: string }>(
        "/upload/image",
        file,
      );

      if (response.success && response.data) {
        return response.data.url;
      }

      throw new Error(response.error || "Failed to upload image");
    },

    async deleteImage(url: string): Promise<void> {
      const response = await HTTPClient.post("/upload/image", { url });

      if (!response.success) {
        throw new Error(response.error || "Failed to delete image");
      }
    },
  },

  // Search and utilities
  search: {
    async global(
      query: string,
      type: "all" | "notes" | "categories" | "subcategories" = "all",
      limit = 50,
    ): Promise<{
      notes: Note[];
      categories: Category[];
      subcategories: Subcategory[];
    }> {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString(),
      });

      const response = await HTTPClient.get<any>(
        `/search?${params.toString()}`,
      );

      if (response.success && response.data) {
        return {
          notes: (response.data.notes || []).map(transformDbNote),
          categories: (response.data.categories || []).map(transformDbCategory),
          subcategories: (response.data.subcategories || []).map(
            transformDbSubcategory,
          ),
        };
      }

      throw new Error(response.error || "Search failed");
    },

    async getTags(): Promise<Array<{ tag: string; count: number }>> {
      const response =
        await HTTPClient.get<Array<{ tag: string; count: number }>>("/tags");

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch tags");
    },
  },
};

export { AuthManager };
