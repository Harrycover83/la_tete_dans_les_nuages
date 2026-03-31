import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.get('/me/transactions', authenticate, userController.getMyTransactions);
router.get('/:id/stats', authenticate, userController.getUserStats);

export default router;
