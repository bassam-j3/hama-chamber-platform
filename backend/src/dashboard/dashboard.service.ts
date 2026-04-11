import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      pages,
      news,
      boardMembers,
      projects,
      circulars,
      laws,
      exhibitions,
      opportunities,
      banners,
      faqs,
    ] = await Promise.all([
      this.prisma.page.count({ where: { isActive: true } }),
      this.prisma.news.count({ where: { isActive: true } }),
      this.prisma.boardMember.count({ where: { isActive: true } }),
      this.prisma.project.count({ where: { isActive: true } }),
      this.prisma.circular.count({ where: { isActive: true } }),
      this.prisma.law.count({ where: { isActive: true } }),
      this.prisma.exhibition.count({ where: { isActive: true } }),
      this.prisma.opportunity.count({ where: { isActive: true } }),
      this.prisma.banner.count({ where: { isActive: true } }),
      this.prisma.faq.count({ where: { isActive: true } }),
    ]);

    return {
      pages,
      news,
      boardMembers,
      projects,
      circulars,
      laws,
      exhibitions,
      opportunities,
      banners,
      faqs,
    };
  }

  async getRecentActivity() {
    const [news, projects, circulars] = await Promise.all([
      this.prisma.news.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.circular.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    const activity = [
      ...news.map((n) => ({ ...n, type: 'NEWS', icon: 'campaign' })),
      ...projects.map((p) => ({ ...p, type: 'PROJECT', icon: 'domain' })),
      ...circulars.map((c) => ({ ...c, type: 'CIRCULAR', icon: 'assignment' })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return activity.slice(0, 5);
  }
}
