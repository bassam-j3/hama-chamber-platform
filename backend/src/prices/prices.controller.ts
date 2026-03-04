import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PricesService } from './prices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  getPrices() { return this.pricesService.getPrices(); }

  @Put()
  @UseGuards(JwtAuthGuard)
  updatePrices(@Body() body: any) { return this.pricesService.updatePrices(body); }
}