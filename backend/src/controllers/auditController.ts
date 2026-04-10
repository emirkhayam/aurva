import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getSupabaseClient, getPaginationRange } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';

export const getAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 50, entity_type, action, user_id } = req.query;
  const supabase = getSupabaseClient();
  const { from, to } = getPaginationRange({ page: Number(page), limit: Number(limit) });

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (entity_type) query = query.eq('entity_type', String(entity_type));
  if (action) query = query.eq('action', String(action));
  if (user_id) query = query.eq('user_id', String(user_id));

  const { data, count, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({
    success: true,
    data,
    pagination: {
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil((count || 0) / Number(limit))
    }
  });
});
