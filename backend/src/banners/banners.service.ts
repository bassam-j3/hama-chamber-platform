import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.banner.create({ data });
  }

  findAll() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: any) {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.banner.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
