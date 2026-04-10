import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { authenticateClient } from '../middleware/cabinetAuth';
import {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  getCourseCertificates,
} from '../controllers/certificateController';

const router = Router();

// POST /api/certificates/generate - Generate certificate (client auth)
router.post('/generate', authenticateClient, generateCertificate);

// GET /api/certificates/my - My certificates (client auth)
router.get('/my', authenticateClient, getMyCertificates);

// GET /api/certificates/verify/:number - Verify certificate (public)
router.get('/verify/:number', verifyCertificate);

// GET /api/certificates/course/:courseId - Course certificates (admin auth)
router.get('/course/:courseId', authenticateToken, requireAdmin, getCourseCertificates);

export default router;
