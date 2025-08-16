
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS - IMPORTANTE: Agregar dominios de producción
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://vercel.app',
      /^https:\/\/.*\.vercel\.app$/,           // Todos los dominios de Vercel
      /^https:\/\/.*\.railway\.app$/,         // Railway domains
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,   // IP local
      /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,    // IP local
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  // Servir imágenes estáticas
  app.useStaticAssets(join(process.cwd(), 'src', 'img'), {
    prefix: '/static/img/',
  });

  // ✅ PUERTO DINÁMICO para Railway
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`📸 Imágenes en: http://localhost:${port}/static/img/`);
}
bootstrap();
