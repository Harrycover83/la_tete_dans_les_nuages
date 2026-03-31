import { gazetteService } from '../../services/gazette.service';
import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { CACHE_KEYS } from '../../constants';

jest.mock('../../utils/prisma');
jest.mock('../../utils/redis');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe('GazetteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getArticles', () => {
    it('should return articles from cache if available', async () => {
      const cachedArticles = JSON.stringify([
        {
          id: 'article-1',
          title: 'Test Article',
          content: 'Content',
          type: 'NEWS',
          pinned: false,
          targetVenueId: null
        }
      ]);

      redisMock.get = jest.fn().mockResolvedValue(cachedArticles);

      const result = await gazetteService.getArticles('venue-1');

      expect(result).toEqual(JSON.parse(cachedArticles));
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEYS.GAZETTE_ARTICLES('venue-1'));
    });

    it('should fetch from DB if not in cache', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          title: 'Article 1',
          content: 'Content 1',
          type: 'NEWS',
          pinned: true,
          targetVenueId: 'venue-1',
          createdAt: new Date()
        },
        {
          id: 'article-2',
          title: 'Article 2',
          content: 'Content 2',
          type: 'PROMOTION',
          pinned: false,
          targetVenueId: null,
          createdAt: new Date()
        }
      ];

      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.article.findMany = jest.fn().mockResolvedValue(mockArticles);
      redisMock.setex = jest.fn().mockResolvedValue('OK');

      const result = await gazetteService.getArticles('venue-1');

      expect(result).toEqual(mockArticles);
      expect(prismaMock.article.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ targetVenueId: 'venue-1' }, { targetVenueId: null }]
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
      });
    });
  });

  describe('getArticleById', () => {
    it('should return article by ID', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Test Article',
        content: 'Full content here',
        type: 'NEWS',
        pinned: false
      };

      prismaMock.article.findUnique = jest.fn().mockResolvedValue(mockArticle);

      const result = await gazetteService.getArticleById('article-1');

      expect(result).toEqual(mockArticle);
      expect(prismaMock.article.findUnique).toHaveBeenCalledWith({
        where: { id: 'article-1' }
      });
    });

    it('should return null if article not found', async () => {
      prismaMock.article.findUnique = jest.fn().mockResolvedValue(null);

      const result = await gazetteService.getArticleById('invalid-id');

      expect(result).toBeNull();
    });
  });
});
