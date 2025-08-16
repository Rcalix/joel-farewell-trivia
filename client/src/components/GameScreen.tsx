import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Image as ImageIcon, Heart, AlertCircle } from 'lucide-react';
import imageService from '../service/ImageService';

interface Question {
  id: string;
  question: string;
  options: Array<{
    letter: string;
    text: string;
    icon: string;
    color: string;
  }>;
}

interface Player {
  id: string;
  name: string;
  isJoel: boolean;
  socketId: string;
}

interface GameScreenProps {
  question: Question | null;
  timeLeft: number;
  currentQuestionNum: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => void;
  myAnswer: string | null;
  currentPlayer: Player;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  question, 
  timeLeft, 
  currentQuestionNum, 
  totalQuestions, 
  onSubmitAnswer, 
  myAnswer, 
  currentPlayer 
}) => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imagesAvailable, setImagesAvailable] = useState<boolean>(false);

  // Verificar disponibilidad de imágenes y obtener nueva imagen cuando cambie la pregunta
  useEffect(() => {
    const loadImage = async () => {
      if (question) {
        try {
          // Verificar si el servicio está inicializado
          if (!imageService.isInitialized()) {
            console.log('⏳ Esperando inicialización del ImageService...');
          }

          const newImage = await imageService.getNextRandomImage();
          console.log('🔍 Image path details:', {
  path: newImage,
  isAbsolute: newImage?.startsWith('/'),
  hasExtension: /\.(jpg|jpeg|png|gif|webp)$/i.test(newImage || ''),
  fullUrl: window.location.origin + newImage
});
          
          if (newImage) {
            setCurrentImage(newImage);
            setImageLoaded(false);
            setImageError(false);
            setImagesAvailable(true);
            
            // Debug info
            const stats = imageService.getStats();
            console.log(`📊 Stats de imágenes:`, stats);
          } else {
            console.warn('⚠️ No hay imágenes disponibles');
            setImagesAvailable(false);
            setCurrentImage(null);
          }
        } catch (error) {
          console.error('❌ Error cargando imagen:', error);
          setImageError(true);
          setImagesAvailable(false);
        }
      }
    };

    loadImage();
  }, [question?.id]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    
    console.error('❌ Error cargando imagen:', currentImage);
    setImageError(true);
    setImageLoaded(true);
  };

  

  if (!question) return <div>Cargando pregunta...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                Pregunta {currentQuestionNum}/{totalQuestions}
              </span>
              <span className="text-gray-600">
                {currentPlayer.name} {currentPlayer.isJoel && '👑'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestionNum / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className={`grid gap-6 ${imagesAvailable && currentImage ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Pregunta y opciones */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
              {question.question}
            </h2>

            {myAnswer ? (
              <div className="text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-600 mb-2">¡Respuesta enviada!</h3>
                <p className="text-gray-600 mb-4">Tu respuesta: {myAnswer}</p>
                <p className="text-gray-500">Esperando a los demás jugadores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {question.options.map((option) => (
                  <button
                    key={option.letter}
                    onClick={() => onSubmitAnswer(option.letter)}
                    className={`p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${option.color}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{option.icon}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-lg text-gray-700">{option.letter}.</span>
                        <p className="text-gray-600 mt-1">{option.text}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Imagen del momento gracioso (solo si hay imágenes disponibles) */}
          {imagesAvailable && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Momento Gracioso</h3>
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Recuerdo #{currentQuestionNum} de nuestras aventuras 📸
                </p>
              </div>

              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-200">
                {currentImage ? (
                  <>
                    {/* Loading placeholder */}
                    {!imageLoaded && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
                          <p className="text-gray-500">Cargando recuerdo...</p>
                        </div>
                      </div>
                    )}

                    {/* Error placeholder */}
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                          <p className="text-red-500 text-sm">Error cargando imagen</p>
                          <p className="text-gray-400 text-xs mt-1">Pero el juego continúa! 🎮</p>
                        </div>
                      </div>
                    )}

                    {/* Imagen actual */}
                    <img
                      src={currentImage}
                      alt={`Momento gracioso ${currentQuestionNum}`}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Preparando recuerdo...</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay con efecto */}
                {imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                    <p className="text-white font-semibold p-4 text-center">
                      Recuerdo especial de Joel y amigos 💖
                    </p>
                  </div>
                )}
              </div>

              {/* Info adicional */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
                  <span className="text-pink-600 text-sm font-medium">
                    🎭 Nostalgia Level: Máximo
                  </span>
                </div>
              </div>

              {/* Debug info (solo en desarrollo) */}
              {import.meta.env.MODE === 'development' && (
                <div className="mt-2 text-center">
                  <details className="text-xs text-gray-400">
                    <summary className="cursor-pointer">Debug Info</summary>
                    <p>Imagen: {currentImage}</p>
                    <p>Stats: {JSON.stringify(imageService.getStats())}</p>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mensaje si no hay imágenes */}
        {!imagesAvailable && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-700 text-sm">
                No se encontraron imágenes en src/img/ - El juego continúa sin fotos
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;