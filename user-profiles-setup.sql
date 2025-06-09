-- =============================================================================
-- User Profiles Extension for Personal Notes App
-- =============================================================================
-- This script extends the existing database to include comprehensive user
-- profile data collection and management.
--
-- Instructions:
-- 1. Make sure you've already run the main database-setup.sql script
-- 2. Copy this script to your Supabase SQL Editor
-- 3. Run this script to add user profile tables
-- =============================================================================

-- =============================================================================
-- 1. CREATE USER PROFILES TABLE
-- =============================================================================

-- User profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(100),

  -- Account Status
  account_status VARCHAR(20) DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected')),

    -- Personal Information
    date_of_birth DATE,
    phone_number VARCHAR(20),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

    -- Location Information
    country VARCHAR(100),
    state_province VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Professional Information
    occupation VARCHAR(100),
    company VARCHAR(100),
    website VARCHAR(255),
    bio TEXT,

    -- Preferences
    language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'th', 'zh')),
    theme_preference VARCHAR(20) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "marketing": false}'::jsonb,

    -- Privacy & Security
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    two_factor_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,

    -- Profile Media
    avatar_url TEXT,
    cover_image_url TEXT,

    -- Subscription & Usage
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    storage_used_bytes BIGINT DEFAULT 0,
    notes_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_profile UNIQUE (user_id),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://.*'),
    CONSTRAINT valid_phone CHECK (phone_number IS NULL OR phone_number ~* '^[\+]?[1-9][\d]{0,15}$')
);

-- =============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON public.user_profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_plan);

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICIES
-- =============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Public profiles can be viewed by anyone (for future social features)
DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by anyone" ON public.user_profiles
    FOR SELECT USING (profile_visibility = 'public');

-- =============================================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles table
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_updated_at();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, email, email_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update notes count and storage used for user
    UPDATE public.user_profiles
    SET
        notes_count = (
            SELECT COUNT(*)
            FROM public.notes
            WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        ),
        storage_used_bytes = (
            SELECT COALESCE(SUM(LENGTH(content)), 0)
            FROM public.notes
            WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        ),
        last_active_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update user stats when notes change
DROP TRIGGER IF EXISTS update_user_stats_on_note_insert ON public.notes;
CREATE TRIGGER update_user_stats_on_note_insert
    AFTER INSERT ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS update_user_stats_on_note_update ON public.notes;
CREATE TRIGGER update_user_stats_on_note_update
    AFTER UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS update_user_stats_on_note_delete ON public.notes;
CREATE TRIGGER update_user_stats_on_note_delete
    AFTER DELETE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =============================================================================
-- 6. CREATE HELPFUL VIEWS
-- =============================================================================

-- View for user profile summary
CREATE OR REPLACE VIEW user_profile_summary AS
SELECT
    up.id,
    up.user_id,
    up.username,
    up.email,
    up.first_name,
    up.last_name,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.occupation,
    up.company,
    up.country,
    up.subscription_plan,
    up.notes_count,
    up.storage_used_bytes,
    up.created_at,
    up.last_active_at,
    au.created_at as auth_created_at,
    au.last_sign_in_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- View for public user profiles (for future social features)
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT
    username,
    display_name,
    avatar_url,
    bio,
    occupation,
    company,
    country,
    created_at
FROM public.user_profiles
WHERE profile_visibility = 'public';

-- =============================================================================
-- 7. STORAGE POLICIES FOR AVATARS
-- =============================================================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user avatars
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can view own avatar" ON storage.objects;
CREATE POLICY "Users can view own avatar" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Public avatars are viewable by anyone
DROP POLICY IF EXISTS "Public avatars are viewable" ON storage.objects;
CREATE POLICY "Public avatars are viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- Your user profile system is now ready!
--
-- Features added:
-- ✅ Comprehensive user profiles table
-- ✅ Automatic profile creation on user signup
-- ✅ User statistics tracking
-- ✅ Avatar storage system
-- ✅ Privacy controls
-- ✅ Subscription management
-- ✅ Security policies
-- ✅ Performance indexes

SELECT 'User profile system setup completed successfully! 🎉' as status;
