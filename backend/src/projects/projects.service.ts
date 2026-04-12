import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: any,
    mainFile?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    let imageUrl = null;
    const images: string[] = [];

    if (mainFile) {
      const upload = await this.uploadToCloudinary(mainFile);
      imageUrl = upload.secure_url;
    }

    if (galleryImages) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file);
        images.push(upload.secure_url);
      }
    }

    return this.prisma.project.create({
      data: {
        title: data.title,
        content: data.content,
        isActive: data.isActive === 'true' || data.isActive === true,
        imageUrl,
        images,
      },
    });
  }

  async update(
    id: string,
    data: any,
    mainFile?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('المشروع غير موجود');

    let imageUrl = existing.imageUrl;
    const images = data.remainingImages
      ? JSON.parse(data.remainingImages)
      : [...existing.images];

    if (mainFile) {
      const upload = await this.uploadToCloudinary(mainFile);
      imageUrl = upload.secure_url;
    }

    if (galleryImages) {
      for (const file of galleryImages) {
        const upload = await this.uploadToCloudinary(file);
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
        images,
      },
    });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'hama-chamber/projects' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  // ✅ التعديل المطلوب لـ Phase 1: Soft Delete & Active Only & Pagination
  async findAll(query?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { isActive: true }; // جلب المشاريع النشطة فقط

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.prisma.project.findFirst({
      where: { id, isActive: true },
    });
  }

  remove(id: string) {
    return this.prisma.project.update({
      // تحويل الحذف الحقيقي إلى Soft Delete
      where: { id },
      data: { isActive: false },
    });
  }
}
