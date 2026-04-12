import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLawDto } from './dto/create-law.dto';
import { UpdateLawDto } from './dto/update-law.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class LawsService {
  constructor(private prisma: PrismaService) {}

  async create(createLawDto: CreateLawDto) {
    return this.prisma.law.create({
      data: createLawDto,
    });
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<any>> {
    const page = pagination?.page ? Number(pagination.page) : 1;
    const limit = pagination?.limit ? Number(pagination.limit) : 10;
    const skip = (page - 1) * limit;

    const where = { isActive: true }; // LAW 6: Filter only active items to prevent showing deleted laws

    const [data, total] = await Promise.all([
      this.prisma.law.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.law.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
