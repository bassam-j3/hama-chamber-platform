import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    // Cloudinary automatically picks up the CLOUDINARY_URL environment variable if present.
    // However, if we want to explicitly ensure it or handle potential format issues:
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl) {
       return cloudinary.config(true); // Tell SDK to read from process.env.CLOUDINARY_URL
    } else {
       console.warn('CLOUDINARY_URL is missing!');
       return null;
    }
  },
};

