import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { getSupabaseClient } from '../config/supabase';

export function auditLog(action: string, entityType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = function(body: any) {
      // Only log successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const supabase = getSupabaseClient();
        supabase.from('audit_logs').insert({
          user_id: req.user?.id || null,
          user_email: req.user?.email || null,
          action,
          entity_type: entityType,
          entity_id: req.params?.id || body?.data?.id?.toString() || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
          },
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        }).then(() => {}, (err: any) => console.error('Audit log error:', err));
      }
      return originalJson(body);
    };

    next();
  };
}

function sanitizeBody(body: any): any {
  if (!body) return undefined;
  const sanitized = { ...body };
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.refreshToken;
  return sanitized;
}
