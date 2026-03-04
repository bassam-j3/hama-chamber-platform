import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) { return this.prisma.opportunity.create({ data }); }
  findAll() { return this.prisma.opportunity.findMany({ orderBy: { createdAt: 'desc' } }); }
  update(id: string, data: any) { return this.prisma.opportunity.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.opportunity.delete({ where: { id } }); }
}