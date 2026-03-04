import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.page.create({ data });
  }

  findAll() {
    return this.prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // دالة جديدة لجلب الصفحة عن طريق الرابط (Slug) بدلاً من الـ ID للزوار
  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('الصفحة غير موجودة');
    return page;
  }

  update(id: string, data: any) {
    return this.prisma.page.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}