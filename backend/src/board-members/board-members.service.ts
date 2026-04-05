import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardMemberDto: CreateBoardMemberDto) {
    return this.prisma.boardMember.create({
      data: createBoardMemberDto,
    });
  }

  async findAll() {
    return this.prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }, // عادة ترتيب المجلس يكون تصاعدياً حسب الأهمية
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.boardMember.findFirst({
      where: { id, isActive: true },
    });

    if (!member) {
      throw new NotFoundException(`عضو المجلس غير موجود`);
    }
    return member;
  }

  async update(id: string, updateBoardMemberDto: UpdateBoardMemberDto) {
    await this.findOne(id);
    return this.prisma.boardMember.update({
      where: { id },
      data: updateBoardMemberDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.boardMember.update({
      where: { id },
      data: { isActive: false },
    });
  }
}