import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma';

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        avatarUrl: true,
        emailVerified: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const { firstName, lastName, dateOfBirth } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        avatarUrl: true,
        emailVerified: true,
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const stats = await import('../services/leaderboard.service').then((s) =>
      s.getUserStats(id)
    );
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
