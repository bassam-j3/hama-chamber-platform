import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExhibitionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) { return this.prisma.exhibition.create({ data }); }
  findAll() { return this.prisma.exhibition.findMany({ orderBy: { createdAt: 'desc' } }); }
  update(id: string, data: any) { return this.prisma.exhibition.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.exhibition.delete({ where: { id } }); }
}