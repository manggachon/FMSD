import { Router } from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
} from '../controllers/vehicle.controller';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getVehicles);
router.get('/stats', getVehicleStats);
router.get('/:id', getVehicle);
router.post('/', requireRole('ADMIN', 'MANAGER'), createVehicle);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), updateVehicle);
router.delete('/:id', requireRole('ADMIN'), deleteVehicle);

export default router;
