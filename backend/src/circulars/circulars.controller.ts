import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CircularsService } from './circulars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('circulars')
export class CircularsController {
  constructor(
    private readonly circularsService: CircularsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;
    
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'circulars');
      imageUrl = uploadResult.secure_url;
    }

    const dto = {
      title: body.title,
      content: body.content,
      category: body.category,
      isActive: body.isActive !== 'false',
      imageUrl: imageUrl,
    };
    return this.circularsService.create(dto);
  }

  @Get()
  findAll() {
    return this.circularsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = {
      title: body.title,
      content: body.content,
      category: body.category,
      isActive: body.isActive !== 'false',
    };
    
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'circulars');
      dto.imageUrl = uploadResult.secure_url;
    }
    
    return this.circularsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.circularsService.remove(id);
  }
}