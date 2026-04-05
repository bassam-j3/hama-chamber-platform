import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, mainImage?: Express.Multer.File, galleryImages?: Express.Multer.File[]) {
    let imageUrl = null;
    const images: string[] = [];

    if (mainImage) {
      const upload = await this.uploadToCloudinary(mainImage);
      imageUrl = upload.secure_url;
    }

    if (galleryImages && galleryImages.length > 0) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file);
        images.push(upload.secure_url);
      }
    }

    return this.prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        isActive: data.isActive === 'true' || data.isActive === true,
        imageUrl,
        images
      }
    });
  }

  async update(id: string, data: any, mainImage?: Express.Multer.File, galleryImages?: Express.Multer.File[]) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('الخبر غير موجود');

    let imageUrl = existing.imageUrl;
    // إذا أرسل الفرونت إند مصفوفة الصور المتبقية (بعد الحذف) نقوم بتحديثها
    let images = data.remainingImages ? JSON.parse(data.remainingImages) : [...existing.images];

    if (mainImage) {
      const upload = await this.uploadToCloudinary(mainImage);
      imageUrl = upload.secure_url;
    }

    if (galleryImages && galleryImages.length > 0) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file);
        images.push(upload.secure_url);
      }
    }

    return this.prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        isActive: data.isActive === 'true' || data.isActive === true,
        imageUrl,
        images
      }
    });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'hama-chamber/news' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(file.buffer);
    });
  }

  findAll() { return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.news.findUnique({ where: { id } }); }
  remove(id: string) { return this.prisma.news.delete({ where: { id } }); }
}