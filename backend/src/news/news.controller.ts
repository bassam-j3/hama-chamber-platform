import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // 👈 استيراد الذاكرة المؤقتة بدلاً من التخزين المحلي
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // 👈 استيراد الخدمة السحابية

@Controller('api/v1/news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly cloudinaryService: CloudinaryService // 👈 حقن الخدمة هنا
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  // 👇 استخدام memoryStorage لكي لا يتم حفظ الملف في مجلد uploads أبداً
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = undefined;

    // 👇 الرفع للسحابة فوراً إذا كان هناك ملف
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'news');
      imageUrl = uploadResult.secure_url; // الرابط الدائم من Cloudinary
    }

    const dto = { 
      title: body.title, 
      content: body.content, 
      isActive: body.isActive !== 'false', 
      imageUrl: imageUrl 
    };
    
    return this.newsService.create(dto);
  }

  @Get() 
  findAll() { 
    return this.newsService.findAll(); 
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() })) // 👇 التعديل هنا أيضاً
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const dto: any = { 
      title: body.title, 
      content: body.content, 
      isActive: body.isActive !== 'false' 
    };

    // 👇 تحديث الصورة في السحابة إذا تم رفع صورة جديدة
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'news');
      dto.imageUrl = uploadResult.secure_url;
    }

    return this.newsService.update(id, dto);
  }

  @Delete(':id') 
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) { 
    return this.newsService.remove(id); 
  }
}