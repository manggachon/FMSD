import { Router } from 'express';
import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.post('/', requireRole('ADMIN', 'MANAGER'), createDriver);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), updateDriver);
router.delete('/:id', requireRole('ADMIN'), deleteDriver);

export default router;
