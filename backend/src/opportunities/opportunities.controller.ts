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
import { CacheInterceptor } from '@nestjs/cache-manager'; // Applied by main agent
import { FileInterceptor } from '@nestjs/platform-express';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { uploadOptions } from '../common/utils/upload-options';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'opportunities',
      );
      imageUrl = uploadResult.secure_url;
    }

    const dto = {
      title: body.title,
      content: body.content,
      isActive: body.isActive !== 'false',
      imageUrl: imageUrl,
    };
    return this.opportunitiesService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.opportunitiesService.findAll();
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
      content: body.content,
      isActive: body.isActive !== 'false',
    };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'opportunities',
      );
      dto.imageUrl = uploadResult.secure_url;
    }

    return this.opportunitiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(id);
  }
}
