import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

@Controller('api/v1/opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto = { title: body.title, content: body.content, isActive: body.isActive !== 'false', imageUrl: file ? `http://localhost:3000/uploads/${file.filename}` : undefined };
    return this.opportunitiesService.create(dto);
  }

  @Get() findAll() { return this.opportunitiesService.findAll(); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = { title: body.title, content: body.content, isActive: body.isActive !== 'false' };
    if (file) dto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    return this.opportunitiesService.update(id, dto);
  }

  @Delete(':id') 
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) { return this.opportunitiesService.remove(id); }
}