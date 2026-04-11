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
import { LawsService } from './laws.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { uploadOptions } from '../common/utils/upload-options';

@Controller('laws')
export class LawsController {
  constructor(private readonly lawsService: LawsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto = {
      title: body.title,
      content: body.content,
      isActive: body.isActive !== 'false',
      fileUrl: file
        ? `https://hama-chamber-api.onrender.com/uploads/${file.filename}`
        : undefined,
    };
    return this.lawsService.create(dto);
  }

  @Get()
  findAll() {
    return this.lawsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  update(
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
      dto.fileUrl = `https://hama-chamber-api.onrender.com/uploads/${file.filename}`;
    }
    return this.lawsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.lawsService.remove(id);
  }
}
