import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBoardMemberDto) {
    return this.prisma.boardMember.create({ data: dto });
  }

  async findAll() {
    return this.prisma.boardMember.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async update(id: string, dto: CreateBoardMemberDto) {
    return this.prisma.boardMember.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.boardMember.delete({ where: { id } });
  }
}