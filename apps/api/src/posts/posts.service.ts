import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
    if (!user || user.status !== 'active') {
      throw new ForbiddenException('Akun kamu sedang menunggu persetujuan admin. Kamu belum bisa membuat postingan.');
    }

    return this.prisma.post.create({
      data: {
        userId,
        content: dto.content,
        type: dto.type,
        gadgetId: dto.gadgetId,
        rating: dto.rating,
        mediaUrls: dto.mediaUrls ?? [],
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, trustScore: true } },
        gadget: { select: { id: true, name: true, brand: true, imageUrl: true } },
      },
    });
  }

  async findFeed(userId: string, cursor?: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    return this.prisma.post.findMany({
      where: {
        OR: [
          { userId: { in: followingIds } },
          { userId },
        ],
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, trustScore: true } },
        gadget: { select: { id: true, name: true, brand: true, imageUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, trustScore: true } },
        gadget: { select: { id: true, name: true, brand: true, imageUrl: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
        _count: { select: { likes: true } },
      },
    });
    if (!post) throw new NotFoundException('Post tidak ditemukan');
    return post;
  }

  async delete(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post tidak ditemukan');
    if (post.userId !== userId) throw new ForbiddenException('Bukan post kamu');
    return this.prisma.post.delete({ where: { id: postId } });
  }

  async toggleLike(userId: string, postId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.like.delete({ where: { userId_postId: { userId, postId } } });
        await tx.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
      } else {
        await tx.like.create({ data: { userId, postId } });
        await tx.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
      }
    });

    return { liked: !existing };
  }

  async addComment(userId: string, postId: string, content: string) {
    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: { userId, postId, content },
        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      }),
      this.prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
    ]);
    return comment;
  }

  async toggleBookmark(userId: string, postId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } });
    } else {
      await this.prisma.bookmark.create({ data: { userId, postId } });
    }

    return { bookmarked: !existing };
  }

  async getBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            gadget: { select: { id: true, name: true, brand: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }
}
