-- =============================================================================
-- Personal Notes App - Supabase Database Setup Script
-- =============================================================================
-- This script sets up all the necessary tables, indexes, RLS policies, and 
-- storage buckets for the Personal Notes application.
--
-- Instructions:
-- 1. Copy this entire script
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CREATE TABLES
-- =============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'), -- Hex color validation
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique category names per user
    CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique subcategory names per category
    CONSTRAINT unique_subcategory_per_category UNIQUE (category_id, name)
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT DEFAULT '',
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at);

-- Subcategories indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_user_id ON public.subcategories(user_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_created_at ON public.subcategories(created_at);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subcategory_id ON public.notes(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

-- Full-text search index for notes
CREATE INDEX IF NOT EXISTS idx_notes_search 
ON public.notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICIES
-- =============================================================================

-- Categories policies
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Subcategories policies
DROP POLICY IF EXISTS "Users can view own subcategories" ON public.subcategories;
CREATE POLICY "Users can view own subcategories" ON public.subcategories
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subcategories" ON public.subcategories;
CREATE POLICY "Users can insert own subcategories" ON public.subcategories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subcategories" ON public.subcategories;
CREATE POLICY "Users can update own subcategories" ON public.subcategories
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subcategories" ON public.subcategories;
CREATE POLICY "Users can delete own subcategories" ON public.subcategories
    FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for notes table
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON public.notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. CREATE STORAGE BUCKET AND POLICIES
-- =============================================================================

-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for note images
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'note-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
CREATE POLICY "Users can view own images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'note-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'note-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'note-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =============================================================================
-- 7. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================================================

-- This section will create sample data for testing purposes
-- You can remove this section if you don't want sample data

-- Note: This will only work after you have authenticated users
-- The sample data will be created for the first user who signs up

-- =============================================================================
-- 8. HELPFUL VIEWS (OPTIONAL)
-- =============================================================================

-- View to get category with subcategory count
CREATE OR REPLACE VIEW categories_with_counts AS
SELECT 
    c.id,
    c.name,
    c.color,
    c.user_id,
    c.created_at,
    COALESCE(sub_count.count, 0) as subcategory_count,
    COALESCE(note_count.count, 0) as note_count
FROM categories c
LEFT JOIN (
    SELECT category_id, COUNT(*) as count
    FROM subcategories
    GROUP BY category_id
) sub_count ON c.id = sub_count.category_id
LEFT JOIN (
    SELECT c.id as category_id, COUNT(n.*) as count
    FROM categories c
    LEFT JOIN subcategories s ON c.id = s.category_id
    LEFT JOIN notes n ON s.id = n.subcategory_id
    GROUP BY c.id
) note_count ON c.id = note_count.category_id;

-- View to get notes with category and subcategory info
CREATE OR REPLACE VIEW notes_with_categories AS
SELECT 
    n.id,
    n.title,
    n.content,
    n.tags,
    n.images,
    n.user_id,
    n.created_at,
    n.updated_at,
    s.name as subcategory_name,
    s.id as subcategory_id,
    c.name as category_name,
    c.id as category_id,
    c.color as category_color
FROM notes n
JOIN subcategories s ON n.subcategory_id = s.id
JOIN categories c ON s.category_id = c.id;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- Your database is now ready for the Personal Notes app!
-- 
-- Next steps:
-- 1. Get your Supabase URL and anon key from the project settings
-- 2. Update your .env file with these credentials
-- 3. Enable Supabase mode in the app settings
--
-- Tables created:
-- ✅ categories (with RLS policies)
-- ✅ subcategories (with RLS policies) 
-- ✅ notes (with RLS policies)
-- ✅ Storage bucket for images (with policies)
-- ✅ Performance indexes
-- ✅ Helpful views
-- ✅ Auto-update triggers

SELECT 'Database setup completed successfully! 🎉' as status;
