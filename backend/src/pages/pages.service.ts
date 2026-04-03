import { Injectable } from '@nestjs/common';
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

  update(id: string, data: any) {
    return this.prisma.page.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.page.update({
      where: { id },
      data: { isActive: false },
    });
  }
}