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
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // 👈 السحابة
import { uploadOptions } from '../common/utils/upload-options';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly cloudinaryService: CloudinaryService, // 👈 حقن الخدمة
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    if (file) {
      // 👈 رفع الصورة لمجلد banners في السحابة
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'banners',
      );
      imageUrl = uploadResult.secure_url;
    }

    const dto = {
      title: body.title,
      link: body.link,
      isActive: body.isActive !== 'false',
      imageUrl: imageUrl,
    };

    return this.bannersService.create(dto);
  }

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const dto: any = {
      title: body.title,
      link: body.link,
      isActive: body.isActive !== 'false',
    };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'banners',
      );
      dto.imageUrl = uploadResult.secure_url;
    }

    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
