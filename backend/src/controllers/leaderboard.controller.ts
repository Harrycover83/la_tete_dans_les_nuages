import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as leaderboardService from '../services/leaderboard.service';

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const venueId = req.query.venueId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const entries = await leaderboardService.getLeaderboard(gameId, venueId, page, limit);
    res.json(entries);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function getUserStats(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const stats = await leaderboardService.getUserStats(id);
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function recordGameSession(req: AuthRequest, res: Response) {
  try {
    const { gameId, score, duration } = req.body;
    const session = await leaderboardService.recordGameSession(req.userId!, gameId, score, duration);
    res.status(201).json(session);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
