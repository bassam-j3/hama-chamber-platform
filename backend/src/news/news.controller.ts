import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Put,
  Param,
  Get,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.newsService.findAll({ search, status, ...pagination });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mainImage = files.find((f) => f.fieldname === 'image');
    const gallery = files.filter((f) => f.fieldname === 'gallery');
    return this.newsService.create(body, mainImage, gallery);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mainImage = files.find((f) => f.fieldname === 'image');
    const gallery = files.filter((f) => f.fieldname === 'gallery');
    return this.newsService.update(id, body, mainImage, gallery);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
