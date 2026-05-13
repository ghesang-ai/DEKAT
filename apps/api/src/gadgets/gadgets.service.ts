import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GadgetCategory } from '@prisma/client';

interface FindAllOptions {
  search: string;
  category?: GadgetCategory;
}

@Injectable()
export class GadgetsService {
  constructor(private prisma: PrismaService) {}

  findAll({ search, category }: FindAllOptions) {
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
      orderBy: { reviewCount: 'desc' },
      take: 50,
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
