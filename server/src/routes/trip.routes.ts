import { Router } from 'express';
import {
  getTrips,
  getTrip,
  createTrip,
  startTrip,
  endTrip,
} from '../controllers/trip.controller';

const router = Router();

router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', createTrip);
router.put('/:id/start', startTrip);
router.put('/:id/end', endTrip);

export default router;
