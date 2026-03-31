import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('api/v1/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    if (file) {
      // 👈 رفع الصورة لمجلد projects في السحابة
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'projects');
      imageUrl = uploadResult.secure_url;
    }

    const dto = { 
      title: body.title, 
      description: body.description, 
      status: body.status,
      imageUrl: imageUrl 
    };
    
    return this.projectsService.create(dto);
  }

  @Get() 
  findAll() { 
    return this.projectsService.findAll(); 
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = { 
      title: body.title, 
      description: body.description,
      status: body.status
    };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'projects');
      dto.imageUrl = uploadResult.secure_url;
    }

    return this.projectsService.update(id, dto);
  }

  @Delete(':id') 
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) { 
    return this.projectsService.remove(id); 
  }
}