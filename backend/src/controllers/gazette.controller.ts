import { Request, Response } from 'express';
import { ArticleCategory } from '@prisma/client';
import * as gazetteService from '../services/gazette.service';

export async function getArticles(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as ArticleCategory | undefined;
    const venueId = req.query.venueId as string | undefined;
    const result = await gazetteService.getArticles(page, limit, category, venueId);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function getArticleById(req: Request, res: Response) {
  try {
    const article = await gazetteService.getArticleById(req.params.id);
    res.json(article);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'ARTICLE_NOT_FOUND') {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
