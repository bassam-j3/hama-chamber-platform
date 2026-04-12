import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ) {
    return this.projectsService.create(body, files.image?.[0], files.gallery);
  }

  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.projectsService.findAll(pagination);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ) {
    return this.projectsService.update(
      id,
      body,
      files.image?.[0],
      files.gallery,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
