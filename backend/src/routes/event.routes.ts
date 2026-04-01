import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { apiLimiter } from '../middlewares/rate-limiter.middleware';
import { z } from 'zod';
import * as eventService from '../services/event.service';
import { ERROR_CODES } from '../constants/error-codes';

const router = Router();

// Public: list upcoming events (optional venueId filter)
router.get('/', apiLimiter, async (req, res) => {
  try {
    const venueId = typeof req.query.venueId === 'string' ? req.query.venueId : undefined;
    const events = await eventService.getUpcomingEvents(venueId);
    res.json(events);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Auth: get my bookings — MUST be before /:id to avoid route conflict
router.get('/my/bookings', authenticate, apiLimiter, async (req, res) => {
  try {
    const bookings = await eventService.getUserBookings((req as AuthRequest).userId!);
    res.json(bookings);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Public: get one event
router.get('/:id', apiLimiter, async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_CODES.EVENT_NOT_FOUND) {
      return res.status(404).json({ message: ERROR_CODES.EVENT_NOT_FOUND });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Auth: book an event
const bookSchema = z.object({ eventId: z.string().min(1) });

router.post('/book', authenticate, apiLimiter, validate(bookSchema), async (req, res) => {
  try {
    const booking = await eventService.bookEvent((req as AuthRequest).userId!, req.body.eventId);
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === ERROR_CODES.EVENT_NOT_FOUND) return res.status(404).json({ message: err.message });
      if (err.message === ERROR_CODES.EVENT_FULL) return res.status(409).json({ message: err.message });
      if (err.message === ERROR_CODES.ALREADY_BOOKED) return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Auth: cancel a booking
router.patch('/my/bookings/:id/cancel', authenticate, apiLimiter, async (req, res) => {
  try {
    const booking = await eventService.cancelBooking((req as AuthRequest).userId!, req.params.id);
    res.json(booking);
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_CODES.BOOKING_NOT_FOUND) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
