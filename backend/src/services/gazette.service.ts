import { prisma } from '../utils/prisma';
import { ArticleCategory } from '@prisma/client';
import { ERROR_CODES } from '../constants/error-codes';

export async function getArticles(
  page = 1,
  limit = 20,
  category?: ArticleCategory,
  venueId?: string
) {
  const now = new Date();
  const skip = (page - 1) * limit;

  const where = {
    publishedAt: { lte: now },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    ...(category && { category }),
    ...(venueId && { venues: { some: { venueId } } }),
  };

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take: limit,
      include: { venues: { include: { venue: true } } },
    }),
  ]);

  return { total, page, limit, articles };
}

export async function getArticleById(id: string) {
  const now = new Date();
  const article = await prisma.article.findFirst({
    where: {
      id,
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { venues: { include: { venue: true } } },
  });
  if (!article) throw new Error(ERROR_CODES.ARTICLE_NOT_FOUND);
  return article;
}

export async function createArticle(data: {
  title: string;
  coverImage?: string;
  body: string;
  category: ArticleCategory;
  isPinned?: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  venueIds?: string[];
}) {
  const { venueIds, ...rest } = data;
  return prisma.article.create({
    data: {
      ...rest,
      venues: venueIds
        ? { create: venueIds.map((venueId) => ({ venueId })) }
        : undefined,
    },
    include: { venues: { include: { venue: true } } },
  });
}

export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    coverImage: string;
    body: string;
    category: ArticleCategory;
    isPinned: boolean;
    expiresAt: Date;
    venueIds: string[];
  }>
) {
  const { venueIds, ...rest } = data;
  return prisma.article.update({
    where: { id },
    data: {
      ...rest,
      ...(venueIds !== undefined && {
        venues: {
          deleteMany: {},
          create: venueIds.map((venueId) => ({ venueId })),
        },
      }),
    },
    include: { venues: { include: { venue: true } } },
  });
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
}
