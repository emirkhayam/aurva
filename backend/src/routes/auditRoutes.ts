import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAuditLogs } from '../controllers/auditController';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAuditLogs);

export default router;
