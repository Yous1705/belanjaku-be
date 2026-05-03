import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ImageKit from 'imagekit';

@Injectable()
export class ImagekitService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const response = await this.imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: '/products',
      });

      return response.url;
    } catch (error) {
      throw new InternalServerErrorException('Upload image gagal');
    }
  }

  async uploadMultipleFiles(file: Express.Multer.File[]) {
    const uploadPromises = file.map((file) => this.uploadFile(file));

    return Promise.all(uploadPromises);
  }
}
