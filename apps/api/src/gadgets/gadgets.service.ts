import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GadgetCategory } from '@prisma/client';

interface FindAllOptions {
  search: string;
  category?: GadgetCategory;
  sort?: 'trending' | 'default';
  limit?: number;
}

@Injectable()
export class GadgetsService {
  constructor(private prisma: PrismaService) {}

  findAll({ search, category, sort, limit = 50 }: FindAllOptions) {
    return this.prisma.gadget.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category }),
      },
      orderBy: sort === 'trending'
        ? [{ avgScore: 'desc' }, { reviewCount: 'desc' }]
        : { reviewCount: 'desc' },
      take: limit,
    });
  }

  findTrending(ids: string[]) {
    return this.prisma.gadget.findMany({
      where: { id: { in: ids } },
    });
  }

  findOne(id: string) {
    return this.prisma.gadget.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }
}
