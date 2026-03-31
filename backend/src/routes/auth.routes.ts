import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

router.post(
  '/register',
  validate(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.string().optional(),
    })
  ),
  authController.register
);

router.get('/verify-email/:token', authController.verifyEmail);

router.post(
  '/login',
  validate(z.object({ email: z.string().email(), password: z.string() })),
  authController.login
);

router.post(
  '/refresh',
  validate(z.object({ refreshToken: z.string() })),
  authController.refresh
);

router.post(
  '/logout',
  validate(z.object({ refreshToken: z.string() })),
  authController.logout
);

router.post(
  '/forgot-password',
  validate(z.object({ email: z.string().email() })),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(z.object({ token: z.string(), newPassword: z.string().min(8) })),
  authController.resetPassword
);

export default router;
