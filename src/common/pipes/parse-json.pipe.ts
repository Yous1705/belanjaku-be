import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseMultipartPipe implements PipeTransform {
  transform(value: any) {
    if (!value) return value;

    try {
      // specifications
      if (typeof value.specifications === 'string') {
        value.specifications = JSON.parse(value.specifications);
      }

      // numbers
      if (typeof value.price === 'string') {
        value.price = Number(value.price);
      }

      if (typeof value.stock === 'string') {
        value.stock = Number(value.stock);
      }

      if (typeof value.category === 'string') {
        value.category = Number(value.category);
      }

      return value;
    } catch (err) {
      throw new BadRequestException('Invalid multipart data format');
    }
  }
}
