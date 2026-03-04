import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // استيراد الحارس

// إعدادات رفع صور البانر
const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

@Controller('api/v1/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // قفل الحماية
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto = { 
      title: body.title, 
      link: body.link || null,
      isActive: body.isActive !== 'false', 
      // نأخذ مسار الصورة المرفوعة
      imageUrl: file ? `http://localhost:3000/uploads/${file.filename}` : '' 
    };
    return this.bannersService.create(dto);
  }

  @Get() 
  findAll() { 
    return this.bannersService.findAll(); 
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard) // قفل الحماية
  @UseInterceptors(FileInterceptor('image', { storage: storageOptions }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = { 
      title: body.title, 
      link: body.link || null,
      isActive: body.isActive !== 'false' 
    };
    
    // إذا قام المدير بتغيير الصورة، نقوم بتحديث الرابط
    if (file) {
      dto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    }
    
    return this.bannersService.update(id, dto);
  }

  @Delete(':id') 
  @UseGuards(JwtAuthGuard) // قفل الحماية
  remove(@Param('id') id: string) { 
    return this.bannersService.remove(id); 
  }
}