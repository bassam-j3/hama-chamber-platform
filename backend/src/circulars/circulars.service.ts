import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CircularsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.circular.create({ data });
  }

  findAll() {
    return this.prisma.circular.findMany({ orderBy: { createdAt: 'desc' } });
  }

  update(id: string, data: any) {
    return this.prisma.circular.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.circular.delete({ where: { id } });
  }
}