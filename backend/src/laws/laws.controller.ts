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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LawsService } from './laws.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('laws')
export class LawsController {
  constructor(private readonly lawsService: LawsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: storageOptions }))
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
  findAll(@Query() pagination?: PaginationDto) {
    return this.lawsService.findAll(pagination);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: storageOptions }))
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
