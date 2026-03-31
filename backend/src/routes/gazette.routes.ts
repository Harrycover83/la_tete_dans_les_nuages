import { Router } from 'express';
import * as gazetteController from '../controllers/gazette.controller';

const router = Router();

router.get('/', gazetteController.getArticles);
router.get('/:id', gazetteController.getArticleById);

export default router;
