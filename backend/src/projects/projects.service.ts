import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, mainFile?: Express.Multer.File, galleryImages?: Express.Multer.File[]) {
    let imageUrl = null;
    const images: string[] = [];

    if (mainFile) {
      const type = mainFile.mimetype.startsWith('video') ? 'video' : 'image';
      const upload = await this.uploadToCloudinary(mainFile, type);
      imageUrl = upload.secure_url;
    }

    if (galleryImages) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file, 'image');
        images.push(upload.secure_url);
      }
    }

    return this.prisma.project.create({
      data: {
        title: data.title,
        content: data.content,
        isActive: data.isActive === 'true' || data.isActive === true,
        imageUrl,
        images
      }
    });
  }

  async update(id: string, data: any, mainFile?: Express.Multer.File, galleryImages?: Express.Multer.File[]) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('المشروع غير موجود');

    let imageUrl = existing.imageUrl;
    let images = data.remainingImages ? JSON.parse(data.remainingImages) : [...existing.images];

    if (mainFile) {
      const type = mainFile.mimetype.startsWith('video') ? 'video' : 'image';
      const upload = await this.uploadToCloudinary(mainFile, type);
      imageUrl = upload.secure_url;
    }

    if (galleryImages) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file, 'image');
        images.push(upload.secure_url);
      }
    }

    return this.prisma.project.update({
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

  private async uploadToCloudinary(file: Express.Multer.File, type: 'image' | 'video'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'hama-chamber/projects', resource_type: type }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(file.buffer);
    });
  }

  findAll() { return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.project.findUnique({ where: { id } }); }
  remove(id: string) { return this.prisma.project.delete({ where: { id } }); }
}