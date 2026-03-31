import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';
import * as leaderboardService from '../services/leaderboard.service';

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const profile = await userService.getProfile(req.userId!);
    res.json(profile);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const { firstName, lastName, dateOfBirth, avatarUrl } = req.body;
    const updated = await userService.updateProfile(req.userId!, {
      firstName,
      lastName,
      dateOfBirth,
      avatarUrl,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const stats = await leaderboardService.getUserStats(id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
}

export async function getMyTransactions(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await userService.getTransactionHistory(req.userId!, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
}

