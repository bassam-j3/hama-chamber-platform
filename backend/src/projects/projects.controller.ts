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
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager'; // Applied by main agent
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { uploadOptions } from '../common/utils/upload-options';

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
      uploadOptions,
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
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.projectsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
      ],
      uploadOptions,
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
