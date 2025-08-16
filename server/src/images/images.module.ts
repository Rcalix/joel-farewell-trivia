import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService], // Para usar en otros módulos si necesitas
})
export class ImagesModule {}