import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Joel Trivia API - ¡Listo para la despedida! 🇰🇷';
  }

  getHealth() {
    return {
      status: 'ok',
      message: 'Joel Trivia Server is running',
      timestamp: new Date().toISOString(),
    };
  }
}
