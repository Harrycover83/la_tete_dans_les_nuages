import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as cardService from '../services/card.service';

export async function getMyCard(req: AuthRequest, res: Response) {
  try {
    const card = await cardService.getCard(req.userId!);
    res.json(card);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'CARD_NOT_FOUND') {
      return res.status(404).json({ message: 'Carte non trouvée.' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function debit(req: AuthRequest, res: Response) {
  try {
    const { cardId, amount, description, gameId, machineId } = req.body;
    const card = await cardService.debitCard(cardId, amount, description, gameId, machineId);
    res.json({ balance: card.balance });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CARD_NOT_FOUND') return res.status(404).json({ message: 'Carte non trouvée.' });
      if (err.message === 'INSUFFICIENT_BALANCE') return res.status(400).json({ message: 'Solde insuffisant.' });
      if (err.message === 'INVALID_AMOUNT') return res.status(400).json({ message: 'Montant invalide.' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await cardService.getTransactions(req.userId!, page, limit);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
