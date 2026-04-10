import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';

// Search across news, members, partners, courses
export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q, type, limit = 10 } = req.query;
  const query = String(q || '').trim();

  if (!query || query.length < 2) {
    res.json({ data: { news: [], members: [], partners: [], courses: [] } });
    return;
  }

  const supabase = getSupabaseClient();
  const searchLimit = Math.min(Number(limit), 50);
  const pattern = `%${query}%`;

  const results: any = {};

  if (!type || type === 'news') {
    const { data } = await supabase
      .from('news')
      .select('id, title, slug, excerpt, category, published, created_at')
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(searchLimit);
    results.news = data || [];
  }

  if (!type || type === 'members') {
    const { data } = await supabase
      .from('members')
      .select('id, name, slug, description, logo_url, is_active')
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order('display_order')
      .limit(searchLimit);
    results.members = data || [];
  }

  if (!type || type === 'partners') {
    const { data } = await supabase
      .from('partners')
      .select('id, name, slug, website, logo_url, is_active')
      .or(`name.ilike.${pattern},modal_description.ilike.${pattern}`)
      .order('display_order')
      .limit(searchLimit);
    results.partners = data || [];
  }

  if (!type || type === 'courses') {
    const { data } = await supabase
      .from('courses')
      .select('id, title, slug, description, is_published')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('display_order')
      .limit(searchLimit);
    results.courses = data || [];
  }

  res.json({ success: true, data: results, query });
});
