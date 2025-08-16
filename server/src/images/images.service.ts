// src/images/images.service.ts - CORREGIDO
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private imagesList: string[] = [];
  private usedImages: Set<string> = new Set();

  constructor() {
    this.loadImagesList();
  }

  private loadImagesList(): void {
    try {
      // ✅ CORREGIDO: Usar process.cwd() para ir desde la raíz del proyecto
      const imagesDir = path.join(process.cwd(), 'src', 'img');
      
      this.logger.log(`📂 Leyendo directorio: ${imagesDir}`);

      // Verificar que el directorio existe
      if (!fs.existsSync(imagesDir)) {
        this.logger.error('❌ Directorio de imágenes no existe');
        
        // 🔍 DEBUGGING: Intentar encontrar el directorio correcto
        const alternativePaths = [
          path.join(__dirname, '..', '..', 'src', 'img'),
          path.join(__dirname, 'img'),
          path.join(__dirname, '..', '..', 'img'),
          path.join(process.cwd(), 'src', 'img')
        ];
        
        this.logger.log('🔍 Probando rutas alternativas:');
        for (const altPath of alternativePaths) {
          this.logger.log(`   - ${altPath} -> ${fs.existsSync(altPath) ? '✅ EXISTE' : '❌ NO EXISTE'}`);
        }
        
        return;
      }

      // Leer archivos del directorio
      const files = fs.readdirSync(imagesDir);
      
      // Filtrar solo archivos .jpg y .jpeg
      this.imagesList = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg';
      });

      this.logger.log(`✅ Encontradas ${this.imagesList.length} imágenes JPG`);
      this.logger.log(`📋 Primeras 5: ${this.imagesList.slice(0, 5).join(', ')}`);

    } catch (error) {
      this.logger.error('❌ Error leyendo directorio de imágenes:', error);
      this.imagesList = [];
    }
  }

  async getImagesList() {
    // Recargar la lista en cada petición para detectar nuevas imágenes
    this.loadImagesList();
    
    return {
      success: true,
      images: this.imagesList,
      count: this.imagesList.length,
      baseUrl: '/static/img/',
      fullUrls: this.imagesList.map(img => `/static/img/${img}`)
    };
  }

  async getRandomImage() {
    if (this.imagesList.length === 0) {
      return {
        success: false,
        error: 'No hay imágenes disponibles'
      };
    }

    // Si ya usamos todas, reiniciar
    if (this.usedImages.size >= this.imagesList.length) {
      this.usedImages.clear();
      this.logger.log('🔄 Reiniciando ciclo de imágenes');
    }

    // Encontrar imágenes no usadas
    const availableImages = this.imagesList.filter(img => !this.usedImages.has(img));
    
    if (availableImages.length === 0) {
      return {
        success: false,
        error: 'No hay imágenes disponibles en este ciclo'
      };
    }

    // Seleccionar aleatoria
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex];
    
    // Marcar como usada
    this.usedImages.add(selectedImage);

    return {
      success: true,
      image: selectedImage,
      url: `/static/img/${selectedImage}`,
      used: this.usedImages.size,
      total: this.imagesList.length,
      remaining: this.imagesList.length - this.usedImages.size
    };
  }

  async getStats() {
    return {
      total: this.imagesList.length,
      used: this.usedImages.size,
      remaining: this.imagesList.length - this.usedImages.size,
      directory: 'src/img/',
      baseUrl: '/static/img/'
    };
  }

  resetUsedImages() {
    this.usedImages.clear();
    this.logger.log('🔄 Lista de imágenes usadas reiniciada');
  }
}