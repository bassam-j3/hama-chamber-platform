import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateExhibitionDto) {
    return this.prisma.exhibition.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.exhibition.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.exhibition.findFirst({
      where: { id, isActive: true },
    });
    if (!item) throw new NotFoundException('المعرض غير موجود');
    return item;
  }

  async update(id: string, data: UpdateExhibitionDto) {
    await this.findOne(id);
    return this.prisma.exhibition.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.exhibition.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
