import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.project.create({ data });
  }

  findAll() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: any) {
    return this.prisma.project.update({ 
      where: { id }, 
      data 
    });
  }

  remove(id: string) {
    // Implement Soft Delete instead of hard deleting from the database
    return this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
  }
}