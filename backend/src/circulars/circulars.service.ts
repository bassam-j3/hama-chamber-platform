import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCircularDto } from './dto/create-circular.dto';
import { UpdateCircularDto } from './dto/update-circular.dto';

@Injectable()
export class CircularsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCircularDto) {
    return (this.prisma.circular as any).create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll() {
    return (this.prisma.circular as any).findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await (this.prisma.circular as any).findFirst({
      where: { id, isActive: true },
    });
    if (!item) throw new NotFoundException('التعميم غير موجود');
    return item;
  }

  async update(id: string, data: UpdateCircularDto) {
    await this.findOne(id);
    return (this.prisma.circular as any).update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma.circular as any).update({
      where: { id },
      data: { isActive: false },
    });
  }
}
