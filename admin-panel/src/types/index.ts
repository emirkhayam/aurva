export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  status: 'new' | 'contacted' | 'processed' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'regulation' | 'events' | 'analytics' | 'other';
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: number;
  name: string;
  slug: string;
  description: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  displayOrder: number;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  website?: string;
  logoUrl?: string;
  modalTitle?: string;
  modalDescription?: string;
  benefits?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ClientProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  is_active: boolean;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: number;
  course_id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
