import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: any) {
    return this.prisma.user.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}