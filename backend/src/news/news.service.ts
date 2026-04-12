import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: any,
    mainImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    let imageUrl = data.imageUrl || null;
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

    return (this.prisma.news as any).create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl,
        images,
        isActive: data.isActive === 'true' || data.isActive === true,
      },
    });
  }

  async findAll(query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const { search, status } = query || {};
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      // الفلترة الأساسية: لا نعرض المحذوف ناعماً إلا إذا طلبنا ذلك (افتراضياً isActive: true)
      isActive:
        status === 'inactive' ? false : status === 'active' ? true : true,
      AND: search
        ? [
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            },
          ]
        : [],
    };

    const [data, total] = await Promise.all([
      (this.prisma.news as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma.news as any).count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const news = await (this.prisma.news as any).findFirst({
      where: { id, isActive: true },
    });
    if (!news) throw new NotFoundException('الخبر غير موجود أو تم حذفه');
    return news;
  }

  async update(
    id: string,
    data: any,
    mainImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    const existing = await this.findOne(id);

    let imageUrl = existing.imageUrl;
    const images = data.remainingImages
      ? JSON.parse(data.remainingImages)
      : [...existing.images];

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

    return (this.prisma.news as any).update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl,
        images,
        isActive: data.isActive === 'true' || data.isActive === true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma.news as any).update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'hama-chamber/news' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
