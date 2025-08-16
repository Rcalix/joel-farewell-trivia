import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { ImagesModule } from './images/images.module'; // ✨ NUEVO

@Module({
  imports: [GameModule, ImagesModule], // ✨ AGREGAR ImagesModule
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
