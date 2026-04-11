import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOpportunityDto) {
    return (this.prisma.opportunity as any).create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll() {
    return (this.prisma.opportunity as any).findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await (this.prisma.opportunity as any).findFirst({
      where: { id, isActive: true },
    });
    if (!item) throw new NotFoundException('الفرصة غير موجودة');
    return item;
  }

  async update(id: string, data: UpdateOpportunityDto) {
    await this.findOne(id);
    return (this.prisma.opportunity as any).update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma.opportunity as any).update({
      where: { id },
      data: { isActive: false },
    });
  }
}
