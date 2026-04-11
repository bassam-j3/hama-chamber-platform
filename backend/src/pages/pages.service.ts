import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.page.create({ data });
  }

  findAll() {
    return this.prisma.page.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 👇 This is the method the compiler is looking for!
  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
    });

    if (!page || !page.isActive) {
      throw new NotFoundException(
        `Page with slug '${slug}' not found or inactive`,
      );
    }
    return page;
  }

  update(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.page.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
