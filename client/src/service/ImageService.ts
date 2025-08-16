interface ImageStats {
  total: number;
  used: number;
  remaining: number;
  currentCycle: number;
}

class ImageService {
  private allImages: string[] = [];
  private backendUrl: string = 'http://localhost:3001'; // URL de tu backend
  private initialized: boolean = false;

  constructor() {
    this.loadImages();
  }

  private async loadImages(): Promise<void> {
    try {
      console.log('🔍 Cargando lista de imágenes desde el backend...');
      
      const response = await fetch(`${this.backendUrl}/api/images/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.fullUrls.length > 0) {
        // Usar las URLs completas del backend
        this.allImages = data.fullUrls.map(url => `${this.backendUrl}${url}`);
        
        console.log(`✅ Cargadas ${this.allImages.length} imágenes desde el backend`);
        console.log('📋 Primeras 3:', this.allImages.slice(0, 3));
        
      } else {
        console.error('❌ Backend no devolvió imágenes válidas');
        this.allImages = [];
      }
      
    } catch (error) {
      console.error('❌ Error conectando con backend:', error);
      this.allImages = [];
    }
    
    this.initialized = true;
  }

  private async waitForInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async getNextRandomImage(): Promise<string | null> {
    await this.waitForInitialization();
    
    if (this.allImages.length === 0) {
      console.error('❌ No hay imágenes disponibles');
      return null;
    }

    try {
      // Pedir imagen aleatoria al backend
      const response = await fetch(`${this.backendUrl}/api/images/random`);
      const data = await response.json();
      
      if (data.success) {
        const fullUrl = `${this.backendUrl}${data.url}`;
        console.log(`🖼️ Imagen del backend: ${fullUrl} (${data.used}/${data.total})`);
        return fullUrl;
      } else {
        console.error('❌ Backend no pudo devolver imagen:', data.error);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error obteniendo imagen del backend:', error);
      return null;
    }
  }

  async getStats(): Promise<ImageStats> {
    try {
      const response = await fetch(`${this.backendUrl}/api/images/stats`);
      const data = await response.json();
      
      return {
        total: data.total || 0,
        used: data.used || 0,
        remaining: data.remaining || 0,
        currentCycle: 1
      };
    } catch (error) {
      console.error('❌ Error obteniendo stats:', error);
      return { total: 0, used: 0, remaining: 0, currentCycle: 1 };
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async reloadImages(): Promise<void> {
    this.initialized = false;
    this.allImages = [];
    await this.loadImages();
  }

  // Métodos de compatibilidad (sin usar)
  reset(): void {
    console.log('🔄 Reset manejado por el backend');
  }

  getAllImages(): string[] {
    return [...this.allImages];
  }

  async getRandomImages(count: number = 4): Promise<string[]> {
    const images: string[] = [];
    for (let i = 0; i < count; i++) {
      const image = await this.getNextRandomImage();
      if (image) images.push(image);
    }
    return images;
  }

  getRemainingCount(): number {
    return 0; // El backend maneja esto
  }
}

const imageService = new ImageService();
export default imageService;