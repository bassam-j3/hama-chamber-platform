import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.pagesService.create(body);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.pagesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}