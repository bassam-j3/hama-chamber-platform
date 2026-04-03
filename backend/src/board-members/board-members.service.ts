import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.boardMember.create({ data });
  }

  findAll() {
    return this.prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }, // ملاحظة: الترتيب هنا تصاعدي حسب طلبك المسبق
    });
  }

  update(id: string, data: any) {
    return this.prisma.boardMember.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.boardMember.update({
      where: { id },
      data: { isActive: false },
    });
  }
}