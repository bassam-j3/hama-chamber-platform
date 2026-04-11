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
}
