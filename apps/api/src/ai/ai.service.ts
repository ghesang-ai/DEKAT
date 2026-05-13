import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CompareRequestDto } from './dto/compare-request.dto';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('ai-compare') private compareQueue: Bull.Queue,
  ) {}

  async createComparison(userId: string, dto: CompareRequestDto) {
    const comparison = await this.prisma.aiComparison.create({
      data: {
        userId,
        gadgetIds: dto.gadgetIds,
        userBudget: dto.userBudget,
        userUsecase: dto.userUsecase,
        status: 'pending',
      },
    });

    await this.compareQueue.add(
      'process-comparison',
      { comparisonId: comparison.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return comparison;
  }

  async getComparison(id: string, userId: string) {
    const comparison = await this.prisma.aiComparison.findUnique({ where: { id } });
    if (!comparison) throw new NotFoundException('Comparison tidak ditemukan');
    if (comparison.userId !== userId) throw new NotFoundException('Comparison tidak ditemukan');
    return comparison;
  }

  async getGadgetSentiment(gadgetId: string) {
    const reviews = await this.prisma.post.findMany({
      where: { gadgetId, type: { in: ['review'] } },
      select: { content: true, rating: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length === 0) {
      return { gadgetId, reviewCount: 0, avgRating: null, sentiment: null };
    }

    const avgRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;
    return { gadgetId, reviewCount: reviews.length, avgRating: Math.round(avgRating * 10) / 10 };
  }
}
