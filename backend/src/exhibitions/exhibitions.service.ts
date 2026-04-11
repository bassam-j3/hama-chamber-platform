import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateExhibitionDto) {
    return (this.prisma.exhibition as any).create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll() {
    return (this.prisma.exhibition as any).findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await (this.prisma.exhibition as any).findFirst({
      where: { id, isActive: true },
    });
    if (!item) throw new NotFoundException('المعرض غير موجود');
    return item;
  }

  async update(id: string, data: UpdateExhibitionDto) {
    await this.findOne(id);
    return (this.prisma.exhibition as any).update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma.exhibition as any).update({
      where: { id },
      data: { isActive: false },
    });
  }
}
