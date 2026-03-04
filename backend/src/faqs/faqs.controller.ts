import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    const dto = {
      question: body.question,
      answer: body.answer,
      isActive: body.isActive !== false && body.isActive !== 'false'
    };
    return this.faqsService.create(dto);
  }

  @Get()
  findAll() {
    return this.faqsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    const dto = {
      question: body.question,
      answer: body.answer,
      isActive: body.isActive !== false && body.isActive !== 'false'
    };
    return this.faqsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}