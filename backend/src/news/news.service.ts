import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.news.create({ data });
  }

  findAll() {
    return this.prisma.news.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: any) {
    return this.prisma.news.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.news.update({
      where: { id },
      data: { isActive: false },
    });
  }
}