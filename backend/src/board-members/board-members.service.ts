import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class BoardMembersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, file?: Express.Multer.File) {
    let imageUrl = data.imageUrl || null;
    if (file) {
      const upload = await this.uploadToCloudinary(file);
      imageUrl = upload.secure_url;
    }
    return this.prisma.boardMember.create({
      data: {
        name: data.name,
        roleTitle: data.roleTitle,
        imageUrl,
        isActive: data.isActive === 'true' || data.isActive === true,
      },
    });
  }

  async findAll() {
    return this.prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.boardMember.findFirst({
      where: { id, isActive: true },
    });
    if (!member) throw new NotFoundException('عضو المجلس غير موجود');
    return member;
  }

  async update(id: string, data: any, file?: Express.Multer.File) {
    const existing = await this.findOne(id);
    let imageUrl = existing.imageUrl;

    if (file) {
      const upload = await this.uploadToCloudinary(file);
      imageUrl = upload.secure_url;
    }

    return this.prisma.boardMember.update({
      where: { id },
      data: {
        name: data.name,
        roleTitle: data.roleTitle,
        imageUrl,
        isActive: data.isActive === 'true' || data.isActive === true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.boardMember.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'hama-chamber/board-members' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
