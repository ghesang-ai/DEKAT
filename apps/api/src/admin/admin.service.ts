import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, posts, gadgets, invites, pendingCompares] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.gadget.count(),
      this.prisma.invite.count({ where: { usedById: null, expiresAt: { gt: new Date() } } }),
      this.prisma.aiComparison.count({ where: { status: 'pending' } }),
    ]);
    return { users, posts, gadgets, activeInvites: invites, pendingCompares };
  }

  async getPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          gadget: { select: { id: true, name: true, brand: true } },
        },
      }),
      this.prisma.post.count(),
    ]);
    return { data, total, page, limit };
  }

  async deletePost(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post tidak ditemukan');
    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post berhasil dihapus' };
  }

  async getUsers(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ username: { contains: search, mode: 'insensitive' as const } }, { displayName: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit, where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, displayName: true, email: true,
          avatarUrl: true, trustScore: true, role: true, createdAt: true,
          _count: { select: { posts: true, followers: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async updateTrustScore(userId: string, trustScore: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.prisma.user.update({ where: { id: userId }, data: { trustScore } });
  }

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async getInvites(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invite.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { username: true, displayName: true } },
          usedBy: { select: { username: true, displayName: true } },
        },
      }),
      this.prisma.invite.count(),
    ]);
    return { data, total, page, limit };
  }

  async createInvite(adminId: string, count = 1) {
    const codes = await Promise.all(
      Array.from({ length: count }).map(() => {
        const code = `DEKAT-${nanoid(8).toUpperCase()}`;
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return this.prisma.invite.create({ data: { code, createdById: adminId, expiresAt } });
      }),
    );
    return codes;
  }
}
