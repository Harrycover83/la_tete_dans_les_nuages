import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { apiLimiter } from '../middlewares/rate-limiter.middleware';
import * as sessionBookingService from '../services/session-booking.service';
import { ERROR_CODES } from '../constants/error-codes';

const router = Router();

const createSchema = z.object({
  venueId: z.string().min(1),
  eventTypeId: z.string().min(1),
  participants: z.number().int().min(1).max(50),
  bookingDate: z.string().datetime(),
  timeSlot: z.string().min(1),
  formulaId: z.string().optional(),
  cakeId: z.string().optional(),
  totalPrice: z.number().min(0),
  notes: z.string().max(500).optional(),
});

// Auth: create a session booking
router.post('/', authenticate, apiLimiter, validate(createSchema), async (req, res) => {
  try {
    const booking = await sessionBookingService.createSessionBooking({
      userId: (req as AuthRequest).userId!,
      ...req.body,
      bookingDate: new Date(req.body.bookingDate),
    });
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === ERROR_CODES.VENUE_NOT_FOUND) return res.status(404).json({ message: err.message });
      if (err.message === ERROR_CODES.INVALID_BOOKING_DATE) return res.status(400).json({ message: err.message });
      if (err.message === ERROR_CODES.INVALID_PARTICIPANTS) return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Auth: get my session bookings
router.get('/my', authenticate, apiLimiter, async (req, res) => {
  try {
    const bookings = await sessionBookingService.getUserSessionBookings((req as AuthRequest).userId!);
    res.json(bookings);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// Auth: cancel a session booking
router.patch('/:id/cancel', authenticate, apiLimiter, async (req, res) => {
  try {
    const booking = await sessionBookingService.cancelSessionBooking(
      (req as AuthRequest).userId!,
      req.params.id,
    );
    res.json(booking);
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_CODES.SESSION_BOOKING_NOT_FOUND) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
