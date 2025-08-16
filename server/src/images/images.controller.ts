import { Controller, Get } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('list')
  async getImagesList() {
    return this.imagesService.getImagesList();
  }

  @Get('random')
  async getRandomImage() {
    return this.imagesService.getRandomImage();
  }

  @Get('stats')
  async getImagesStats() {
    return this.imagesService.getStats();
  }
}