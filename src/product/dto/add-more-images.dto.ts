import { IsString } from 'class-validator';

export class addMoreImagesDto {
  @IsString({ each: true })
  images: string[];
}
