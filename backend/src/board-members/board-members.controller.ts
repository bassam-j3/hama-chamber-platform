import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BoardMembersService } from './board-members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // استيراد الحارس

// إعدادات حفظ الملفات
const storageOptions = diskStorage({
  destination: './uploads', // المجلد الذي أنشأناه
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`); // توليد اسم فريد
  }
});

@Controller('api/v1/board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // قفل الحماية
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto = {
      name: body.name,
      roleTitle: body.roleTitle,
      isActive: body.isActive !== 'false', // FormData ترسل القيم المنطقية كنصوص
      // إذا تم رفع صورة، احفظ الرابط الكامل لها
      imageUrl: file ? `http://localhost:3000/uploads/${file.filename}` : undefined,
    };
    return this.boardMembersService.create(dto);
  }

  @Get()
  findAll() {
    return this.boardMembersService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard) // قفل الحماية
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = {
      name: body.name,
      roleTitle: body.roleTitle,
      isActive: body.isActive !== 'false',
    };
    if (file) {
      dto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    }
    return this.boardMembersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // قفل الحماية
  remove(@Param('id') id: string) {
    return this.boardMembersService.remove(id);
  }
}