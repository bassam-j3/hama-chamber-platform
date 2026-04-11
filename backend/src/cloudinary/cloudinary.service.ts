import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadImage(
    file: Express.Multer.File,
    folderName: string = 'hama-chamber',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Validate file size manually just in case the interceptor misses it
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
         return reject(new BadRequestException('حجم الملف يتجاوز الحد المسموح (5MB)'));
      }

      // Ensure it's actually an image
      if (!file.mimetype.startsWith('image/')) {
         return reject(new BadRequestException('نوع الملف غير مدعوم، يجب رفع صورة فقط.'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: folderName,
          format: 'webp', // Force auto conversion to webp for better performance
          quality: 'auto', // Cloudinary auto-optimization
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

