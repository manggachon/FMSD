import { Router } from 'express';
import {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  getUpcomingMaintenance,
} from '../controllers/maintenance.controller';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getMaintenanceRecords);
router.get('/upcoming', getUpcomingMaintenance);
router.get('/:id', getMaintenanceRecord);
router.post('/', requireRole('ADMIN', 'MANAGER', 'MECHANIC'), createMaintenanceRecord);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'MECHANIC'), updateMaintenanceRecord);

export default router;
