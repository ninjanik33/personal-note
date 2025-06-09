# Personal Notes App - Backend API Specification

## Overview

This document outlines all the API endpoints your custom PostgreSQL backend needs to implement for the note-taking application.

## Base URL

```
https://your-api-domain.com/api
```

## Authentication

All API endpoints require authentication. Include the user token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Data Models

### User

```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  color: string; // Hex color code (e.g., "#3b82f6")
  user_id: string;
  created_at: string;
}
```

### Subcategory

```typescript
interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  user_id: string;
  created_at: string;
}
```

### Note

```typescript
interface Note {
  id: string;
  title: string;
  content: string; // Rich text HTML content
  subcategory_id: string;
  tags: string[]; // Array of tag strings
  images: string[]; // Array of image URLs
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

## Authentication Endpoints

### POST /auth/login

Login user with credentials

```json
// Request
{
  "username": "string",
  "password": "string"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "token": "jwt_token_string"
  }
}

// Error Response (401)
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /auth/register

Register new user

```json
// Request
{
  "username": "string",
  "email": "string",
  "password": "string"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "token": "jwt_token_string"
  }
}
```

### POST /auth/logout

Logout user (invalidate token)

```json
// Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current user info

```json
// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
}
```

## Category Endpoints

### GET /categories

Get all categories for the authenticated user

```json
// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "user_id": "string",
      "created_at": "string",
      "subcategories": [
        {
          "id": "string",
          "name": "string",
          "category_id": "string",
          "user_id": "string",
          "created_at": "string"
        }
      ]
    }
  ]
}
```

### POST /categories

Create a new category

```json
// Request
{
  "name": "string",
  "color": "string"
}

// Response (201)
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string",
    "user_id": "string",
    "created_at": "string"
  }
}
```

### PUT /categories/:id

Update a category

```json
// Request
{
  "name": "string", // optional
  "color": "string" // optional
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string",
    "user_id": "string",
    "created_at": "string"
  }
}
```

### DELETE /categories/:id

Delete a category (also deletes all subcategories and notes)

```json
// Response (200)
{
  "success": true,
  "message": "Category deleted successfully"
}
```

## Subcategory Endpoints

### GET /subcategories

Get all subcategories for the authenticated user

```json
// Query Parameters (optional):
// - category_id: Filter by specific category

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "category_id": "string",
      "user_id": "string",
      "created_at": "string"
    }
  ]
}
```

### POST /subcategories

Create a new subcategory

```json
// Request
{
  "name": "string",
  "category_id": "string"
}

// Response (201)
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category_id": "string",
    "user_id": "string",
    "created_at": "string"
  }
}
```

### PUT /subcategories/:id

Update a subcategory

```json
// Request
{
  "name": "string" // optional
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category_id": "string",
    "user_id": "string",
    "created_at": "string"
  }
}
```

### DELETE /subcategories/:id

Delete a subcategory (also deletes all notes in it)

```json
// Response (200)
{
  "success": true,
  "message": "Subcategory deleted successfully"
}
```

## Note Endpoints

### GET /notes

Get all notes for the authenticated user

```json
// Query Parameters (optional):
// - subcategory_id: Filter by specific subcategory
// - category_id: Filter by specific category (gets notes from all subcategories)
// - search: Search in title and content
// - tags: Comma-separated list of tags to filter by
// - limit: Number of notes to return (default: 100)
// - offset: Number of notes to skip (for pagination)

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "subcategory_id": "string",
      "tags": ["string"],
      "images": ["string"],
      "user_id": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /notes/:id

Get a specific note

```json
// Response (200)
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "subcategory_id": "string",
    "tags": ["string"],
    "images": ["string"],
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### POST /notes

Create a new note

```json
// Request
{
  "title": "string",
  "content": "string", // Rich text HTML
  "subcategory_id": "string",
  "tags": ["string"], // optional
  "images": ["string"] // optional
}

// Response (201)
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "subcategory_id": "string",
    "tags": ["string"],
    "images": ["string"],
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### PUT /notes/:id

Update a note

```json
// Request
{
  "title": "string", // optional
  "content": "string", // optional
  "tags": ["string"], // optional
  "images": ["string"] // optional
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "subcategory_id": "string",
    "tags": ["string"],
    "images": ["string"],
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### DELETE /notes/:id

Delete a note

```json
// Response (200)
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## File Upload Endpoints

### POST /upload/image

Upload an image file

```json
// Request: multipart/form-data
// - file: Image file (jpg, png, gif, webp)
// - folder: Optional folder name (defaults to user_id)

// Response (201)
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/uploads/images/user_id/filename.jpg",
    "filename": "filename.jpg",
    "size": 1024576,
    "mimeType": "image/jpeg"
  }
}
```

### DELETE /upload/image

Delete an image file

```json
// Request
{
  "url": "string" // Full URL of the image to delete
}

// Response (200)
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Search and Utility Endpoints

### GET /search

Global search across all user's notes

```json
// Query Parameters:
// - q: Search query string
// - type: 'notes', 'categories', 'subcategories', or 'all' (default: 'all')
// - limit: Number of results (default: 50)

// Response (200)
{
  "success": true,
  "data": {
    "notes": [...],
    "categories": [...],
    "subcategories": [...]
  }
}
```

### GET /tags

Get all unique tags used by the user

```json
// Response (200)
{
  "success": true,
  "data": [
    {
      "tag": "string",
      "count": 5 // Number of notes using this tag
    }
  ]
}
```

## Error Responses

All endpoints should return consistent error responses:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "Field is required"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_subcategories_user_id ON subcategories(user_id);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_subcategory_id ON notes(subcategory_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_search ON notes USING GIN(to_tsvector('english', title || ' ' || content));
```

## Security Requirements

1. **Authentication**: JWT-based authentication
2. **Authorization**: Users can only access their own data
3. **Input Validation**: Validate all inputs server-side
4. **SQL Injection**: Use parameterized queries
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **File Upload**: Validate file types and sizes for image uploads
7. **CORS**: Configure CORS properly for your frontend domain

## Performance Considerations

1. **Pagination**: Implement pagination for large datasets
2. **Caching**: Cache frequently accessed data
3. **Database Indexing**: Proper indexing for search queries
4. **File Storage**: Use cloud storage (AWS S3, etc.) for images in production
5. **Connection Pooling**: Use connection pooling for database connections

This specification provides everything your backend needs to implement to work with the note-taking app frontend!
