import { Router } from 'express';
import {
  getFleetSummary,
  getVehicleUtilization,
  getFuelReport,
  getMaintenanceCostReport,
} from '../controllers/report.controller';

const router = Router();

router.get('/fleet-summary', getFleetSummary);
router.get('/vehicle-utilization', getVehicleUtilization);
router.get('/fuel', getFuelReport);
router.get('/maintenance-cost', getMaintenanceCostReport);

export default router;
