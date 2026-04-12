import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const uploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'عذراً، يسمح فقط برفع الصور (jpg, jpeg, png, gif, webp)',
        ),
        false,
      );
    }
  },
};
