import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LawsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.law.create({ data });
  }

  findAll() {
    return this.prisma.law.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: any) {
    return this.prisma.law.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.law.update({
      where: { id },
      data: { isActive: false },
    });
  }
}