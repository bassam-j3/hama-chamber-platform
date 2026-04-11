import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPrices() {
    let price = await this.prisma.marketPrice.findUnique({
      where: { id: 'global' },
    });
    if (!price) {
      price = await this.prisma.marketPrice.create({
        data: { id: 'global', dollarPrice: '0', gold21Price: '0' },
      });
    }
    return price;
  }

  async updatePrices(data: any) {
    return this.prisma.marketPrice.upsert({
      where: { id: 'global' },
      update: { dollarPrice: data.dollarPrice, gold21Price: data.gold21Price },
      create: {
        id: 'global',
        dollarPrice: data.dollarPrice,
        gold21Price: data.gold21Price,
      },
    });
  }
}
