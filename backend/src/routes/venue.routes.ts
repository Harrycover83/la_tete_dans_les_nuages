import { Router } from 'express';
import { apiLimiter } from '../middlewares/rate-limiter.middleware';
import * as venueService from '../services/venue.service';
import { ERROR_CODES } from '../constants/error-codes';

const router = Router();

router.get('/', apiLimiter, async (_req, res) => {
  try {
    const venues = await venueService.getVenues();
    res.json(venues);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.get('/:id', apiLimiter, async (req, res) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    res.json(venue);
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_CODES.VENUE_NOT_FOUND) {
      return res.status(404).json({ message: ERROR_CODES.VENUE_NOT_FOUND });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
