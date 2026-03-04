import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.faq.create({ data });
  }

  findAll() {
    return this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } });
  }

  update(id: string, data: any) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }
}