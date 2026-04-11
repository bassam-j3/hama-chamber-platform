import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExhibitionsService } from './exhibitions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(
    private readonly exhibitionsService: ExhibitionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'exhibitions',
      );
      imageUrl = uploadResult.secure_url;
    }

    const dto = {
      title: body.title,
      content: body.content,
      isActive: body.isActive !== 'false',
      imageUrl: imageUrl,
    };
    return this.exhibitionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.exhibitionsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const dto: any = {
      title: body.title,
      content: body.content,
      isActive: body.isActive !== 'false',
    };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'exhibitions',
      );
      dto.imageUrl = uploadResult.secure_url;
    }

    return this.exhibitionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.exhibitionsService.remove(id);
  }
}
