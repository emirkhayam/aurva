/**
 * Database Types for Supabase
 * Auto-generated TypeScript interfaces for all tables
 *
 * These types match the SQL schema in supabase-migration.sql
 */

// =====================================================
// USER PROFILES
// =====================================================

export interface UserProfile {
  id: string; // UUID from auth.users
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  is_active: boolean;
  last_login: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface UserProfileInsert {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'moderator';
  is_active?: boolean;
  last_login?: string | null;
}

export interface UserProfileUpdate {
  email?: string;
  name?: string;
  role?: 'admin' | 'moderator';
  is_active?: boolean;
  last_login?: string | null;
}

// =====================================================
// NEWS
// =====================================================

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'regulation' | 'events' | 'analytics' | 'other';
  image_url: string | null;
  published: boolean;
  published_at: string | null; // ISO timestamp
  views: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface NewsInsert {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: 'regulation' | 'events' | 'analytics' | 'other';
  image_url?: string | null;
  published?: boolean;
  published_at?: string | null;
  views?: number;
}

export interface NewsUpdate {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: 'regulation' | 'events' | 'analytics' | 'other';
  image_url?: string | null;
  published?: boolean;
  published_at?: string | null;
  views?: number;
}

// =====================================================
// NEWS IMAGES
// =====================================================

export interface NewsImage {
  id: number;
  news_id: number;
  image_url: string;
  display_order: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface NewsImageInsert {
  news_id: number;
  image_url: string;
  display_order?: number;
}

export interface NewsImageUpdate {
  news_id?: number;
  image_url?: string;
  display_order?: number;
}

// =====================================================
// MEMBERS
// =====================================================

export interface Member {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
  joined_date: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface MemberInsert {
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  display_order?: number;
  joined_date?: string | null;
}

export interface MemberUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  display_order?: number;
  joined_date?: string | null;
}

// =====================================================
// CONTACTS
// =====================================================

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: 'new' | 'contacted' | 'processed' | 'rejected';
  notes: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ContactInsert {
  name: string;
  phone: string;
  email?: string | null;
  status?: 'new' | 'contacted' | 'processed' | 'rejected';
  notes?: string | null;
  ip?: string | null;
  user_agent?: string | null;
}

export interface ContactUpdate {
  name?: string;
  phone?: string;
  email?: string | null;
  status?: 'new' | 'contacted' | 'processed' | 'rejected';
  notes?: string | null;
  ip?: string | null;
  user_agent?: string | null;
}

// =====================================================
// TEAM MEMBERS
// =====================================================

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  bio: string | null;
  category: 'leadership' | 'council' | 'other';
  display_order: number;
  is_active: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface TeamMemberInsert {
  name: string;
  position: string;
  photo_url?: string | null;
  bio?: string | null;
  category?: 'leadership' | 'council' | 'other';
  display_order?: number;
  is_active?: boolean;
}

export interface TeamMemberUpdate {
  name?: string;
  position?: string;
  photo_url?: string | null;
  bio?: string | null;
  category?: 'leadership' | 'council' | 'other';
  display_order?: number;
  is_active?: boolean;
}

// =====================================================
// SITE SETTINGS
// =====================================================

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface SiteSettingInsert {
  key: string;
  value: string;
  description?: string | null;
}

export interface SiteSettingUpdate {
  key?: string;
  value?: string;
  description?: string | null;
}

// =====================================================
// PARTNERS
// =====================================================

export interface Partner {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  logo_url: string | null;
  modal_title: string | null;
  modal_description: string | null;
  benefits: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface PartnerInsert {
  name: string;
  slug: string;
  website?: string | null;
  logo_url?: string | null;
  modal_title?: string | null;
  modal_description?: string | null;
  benefits?: string | null;
  is_active?: boolean;
  display_order?: number;
}

export interface PartnerUpdate {
  name?: string;
  slug?: string;
  website?: string | null;
  logo_url?: string | null;
  modal_title?: string | null;
  modal_description?: string | null;
  benefits?: string | null;
  is_active?: boolean;
  display_order?: number;
}

// =====================================================
// DATABASE TYPE (for Supabase Client)
// =====================================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
        Relationships: [];
      };
      news: {
        Row: News;
        Insert: NewsInsert;
        Update: NewsUpdate;
        Relationships: [];
      };
      news_images: {
        Row: NewsImage;
        Insert: NewsImageInsert;
        Update: NewsImageUpdate;
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: MemberInsert;
        Update: MemberUpdate;
        Relationships: [];
      };
      contacts: {
        Row: Contact;
        Insert: ContactInsert;
        Update: ContactUpdate;
        Relationships: [];
      };
      team_members: {
        Row: TeamMember;
        Insert: TeamMemberInsert;
        Update: TeamMemberUpdate;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSettingInsert;
        Update: SiteSettingUpdate;
        Relationships: [];
      };
      partners: {
        Row: Partner;
        Insert: PartnerInsert;
        Update: PartnerUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'moderator';
      news_category: 'regulation' | 'events' | 'analytics' | 'other';
      contact_status: 'new' | 'contacted' | 'processed' | 'rejected';
      team_member_category: 'leadership' | 'council' | 'other';
    };
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Standard API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Supabase error type
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Auth user with profile
export interface AuthUserWithProfile {
  id: string;
  email: string;
  profile: UserProfile;
}
