import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLawDto } from './dto/create-law.dto';
import { UpdateLawDto } from './dto/update-law.dto';

@Injectable()
export class LawsService {
  constructor(private prisma: PrismaService) {}

  async create(createLawDto: CreateLawDto) {
    return this.prisma.law.create({
      data: createLawDto,
    });
  }

  async findAll() {
    // LAW 6: Filter only active items to prevent showing deleted laws
    return this.prisma.law.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const law = await this.prisma.law.findFirst({
      where: { id, isActive: true },
    });

    if (!law) {
      throw new NotFoundException(`القانون ذو المعرف ${id} غير موجود`);
    }
    return law;
  }

  async update(id: string, updateLawDto: UpdateLawDto) {
    await this.findOne(id);
    return this.prisma.law.update({
      where: { id },
      data: updateLawDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Soft delete implementation
    return this.prisma.law.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
