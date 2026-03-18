-- =====================================================
-- AURVA Database Migration to Supabase (Clean Version)
-- Created: 2026-03-09
-- Description: Full database schema with automatic cleanup
-- =====================================================

-- =====================================================
-- STEP 1: CLEANUP (Remove existing objects)
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Public can read published news" ON public.news;
DROP POLICY IF EXISTS "Public can read published news images" ON public.news_images;
DROP POLICY IF EXISTS "Public can read active members" ON public.members;
DROP POLICY IF EXISTS "Public can read active team members" ON public.team_members;
DROP POLICY IF EXISTS "Public can read active partners" ON public.partners;
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can create contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can read all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage all news images" ON public.news_images;
DROP POLICY IF EXISTS "Admins can manage all members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can manage all team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage all site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.partners;

-- Drop helper function
DROP FUNCTION IF EXISTS public.is_admin_or_moderator();

-- Drop all tables (CASCADE removes triggers and indexes)
DROP TABLE IF EXISTS public.news_images CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop timestamp update function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- =====================================================
-- STEP 2: CREATE FRESH SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- =====================================================
-- 2. NEWS TABLE
-- =====================================================

CREATE TABLE public.news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('regulation', 'events', 'analytics', 'other')),
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_slug ON public.news(slug);
CREATE INDEX idx_news_published ON public.news(published);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);

-- =====================================================
-- 3. NEWS IMAGES TABLE
-- =====================================================

CREATE TABLE public.news_images (
  id BIGSERIAL PRIMARY KEY,
  news_id BIGINT NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_images_news_id ON public.news_images(news_id);
CREATE INDEX idx_news_images_display_order ON public.news_images(display_order);

-- =====================================================
-- 4. MEMBERS TABLE
-- =====================================================

CREATE TABLE public.members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  joined_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_slug ON public.members(slug);
CREATE INDEX idx_members_is_active ON public.members(is_active);
CREATE INDEX idx_members_display_order ON public.members(display_order);

-- =====================================================
-- 5. CONTACTS TABLE
-- =====================================================

CREATE TABLE public.contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'processed', 'rejected')),
  notes TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);

-- =====================================================
-- 6. TEAM MEMBERS TABLE
-- =====================================================

CREATE TABLE public.team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('leadership', 'council', 'other')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_members_category ON public.team_members(category);
CREATE INDEX idx_team_members_is_active ON public.team_members(is_active);
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);

-- =====================================================
-- 7. SITE SETTINGS TABLE
-- =====================================================

CREATE TABLE public.site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_site_settings_key ON public.site_settings(key);

-- =====================================================
-- 8. PARTNERS TABLE
-- =====================================================

CREATE TABLE public.partners (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  logo_url TEXT,
  modal_title TEXT,
  modal_description TEXT,
  benefits TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_slug ON public.partners(slug);
CREATE INDEX idx_partners_is_active ON public.partners(is_active);
CREATE INDEX idx_partners_display_order ON public.partners(display_order);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_images_updated_at BEFORE UPDATE ON public.news_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES
-- =====================================================

CREATE POLICY "Public can read published news"
  ON public.news FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read published news images"
  ON public.news_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.news
      WHERE news.id = news_images.news_id AND news.published = true
    )
  );

CREATE POLICY "Public can read active members"
  ON public.members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active team members"
  ON public.team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active partners"
  ON public.partners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can create contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ADMIN POLICIES
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND is_active = true
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can read all user profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin_or_moderator());

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all news"
  ON public.news FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all news images"
  ON public.news_images FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all members"
  ON public.members FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all contacts"
  ON public.contacts FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all team members"
  ON public.team_members FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can manage all partners"
  ON public.partners FOR ALL
  USING (public.is_admin_or_moderator());

-- =====================================================
-- INITIAL DATA
-- =====================================================

INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', 'AURVA', 'Название сайта'),
  ('site_description', 'Ассоциация управляющих компаний Кыргызской Республики', 'Описание сайта'),
  ('contact_email', 'info@aurva.kg', 'Email для контактов'),
  ('contact_phone', '+996 XXX XXX XXX', 'Телефон для контактов')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ AURVA Database Migration Completed Successfully!';
  RAISE NOTICE '📊 Created 8 tables with indexes and triggers';
  RAISE NOTICE '🔒 Enabled Row Level Security on all tables';
  RAISE NOTICE '✨ Database is ready to use!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '   1. Go to Storage → Create bucket "uploads" (public)';
  RAISE NOTICE '   2. Go to Authentication → Create admin user';
  RAISE NOTICE '   3. Add user profile to user_profiles table';
END $$;
