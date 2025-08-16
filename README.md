# 🎮 Joel Trivia NestJS - Despedida a Corea 🇰🇷

Una aplicación de trivia multijugador en tiempo real construida con **NestJS** + **TypeScript** para despedir a Joel antes de su aventura de 3 años en Corea del Sur.

## 🚀 Características

- **🏗️ NestJS Backend**: Arquitectura robusta con TypeScript, decoradores y validaciones
- **🌐 WebSockets**: Socket.IO para comunicación en tiempo real
- **📱 Mobile-first**: Optimizado para dispositivos móviles
- **🔒 Validaciones**: DTOs y class-validator para validación de datos
- **👑 Sistema Joel**: Solo una persona puede ser Joel (validado en backend)
- **🎯 15 preguntas personalizadas**: Desde anime hasta retos en Corea
- **🏆 Ranking en vivo**: Comparación de respuestas con Joel

## 🏗️ Arquitectura

```
joel-trivia-nestjs/
├── server/                    # Backend NestJS
│   ├── src/
│   │   ├── game/             # Módulo de juego
│   │   │   ├── game.gateway.ts    # WebSocket Gateway
│   │   │   ├── game.service.ts    # Lógica del juego
│   │   │   └── game.module.ts     # Módulo
│   │   ├── common/           # DTOs e interfaces
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   └── interfaces/   # TypeScript interfaces
│   │   ├── data/             # Base de datos de preguntas
│   │   └── main.ts           # Bootstrap de la aplicación
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
└── client/                   # Frontend React
    └── src/
        ├── App.jsx           # Componente principal
        └── main.jsx          # Entry point
```

## 🛠️ Tecnologías

### Backend (NestJS)
- **NestJS**: Framework Node.js con TypeScript
- **Socket.IO**: WebSockets para tiempo real
- **Class Validator**: Validación de DTOs
- **Class Transformer**: Transformación de datos
- **TypeScript**: Tipado estático

### Frontend (React)
- **React 18**: Framework de UI
- **Socket.IO Client**: Cliente WebSocket
- **Tailwind CSS**: Estilos responsivos
- **Lucide React**: Íconos
- **Vite**: Build tool rápido

## 🛠️ Instalación y Ejecución

### 1. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend (nueva terminal)
cd ../client
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
# Terminal 1: Backend NestJS (Puerto 3001)
cd server
npm run start:dev

# Terminal 2: Frontend React (Puerto 3000)
cd client
npm run dev
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Desde móviles**: http://TU_IP_LOCAL:3000

## 📱 Cómo jugar

1. **Conectarse**: Cada persona entra desde su celular a la URL
2. **Unirse**: Ingresar nombre (validación en backend)
3. **Joel único**: Solo uno puede ser Joel (validado server-side)
4. **Lobby**: Esperar a que todos se conecten
5. **Trivia**: Responder 15 preguntas (30 segundos cada una)
6. **Resultados**: Ver respuestas comparadas con Joel
7. **Final**: Ranking de quién conoce mejor a Joel

## 🔧 Características de NestJS

### Validaciones robustas
```typescript
export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  playerName: string;

  @IsBoolean()
  isJoel: boolean;
}
```

### WebSocket Gateway
```typescript
@WebSocketGateway({
  cors: { origin: '*' }
})
export class GameGateway {
  @SubscribeMessage('joinGame')
  @UsePipes(new ValidationPipe())
  handleJoinGame(@MessageBody() dto: JoinGameDto) {
    // Lógica validada automáticamente
  }
}
```

### Service con inyección de dependencias
```typescript
@Injectable()
export class GameService {
  // Lógica del juego centralizada y testeable
}
```

## 🎯 Ventajas de NestJS

- **🏗️ Arquitectura escalable**: Módulos, servicios, controladores
- **🔒 Validaciones automáticas**: DTOs con decoradores
- **📝 TypeScript nativo**: Tipado estático en todo el backend
- **🧪 Testeable**: Inyección de dependencias facilita testing
- **📚 Documentación**: Swagger automático disponible
- **🔧 Middlewares**: Guards, interceptors, pipes listos para usar

## 🌐 Despliegue en producción

### Backend (Heroku/Railway/AWS)
```bash
cd server
npm run build
npm run start:prod
```

### Frontend (Netlify/Vercel)
```bash
cd client
npm run build
```

⚠️ **Importante**: Actualizar `SERVER_URL` en `client/src/App.jsx` con la URL de producción.

## 📱 Scripts útiles

```bash
# Desarrollo con hot reload
npm run start:dev

# Build para producción
npm run build

# Tests
npm run test
npm run test:watch

# Linting
npm run lint
```

## 💝 Mensaje especial

Esta aplicación fue creada con mucho cariño usando **NestJS** para despedir a Joel en su nueva aventura. 

¡Que tengas una experiencia increíble en Corea del Sur! 🇰🇷

¡Te vamos a extrañar! 🎸♟️🎮🌶️🤔

---

**Desarrollado con ❤️ y NestJS para la despedida de Joel**
