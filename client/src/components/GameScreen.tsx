import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Image as ImageIcon, Heart, AlertCircle } from 'lucide-react';
import imageService from '../service/ImageService';

interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  icon: string;
  color: string;
}

interface Question {
  id: number;
  question: string;
  joelAnswer: 'A' | 'B' | 'C' | 'D' | null;
  options: QuestionOption[];
}

// Interfaz para manejar estructura anidada del backend
interface QuestionWrapper {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

interface Player {
  id: string;
  name: string;
  isJoel: boolean;
  socketId: string;
}

interface GameScreenProps {
  question: Question | QuestionWrapper | null;
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
  
  // Estados para cambio de respuesta
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  console.log('🔍 GameScreen props:', {
    question, 
    timeLeft, 
    currentQuestionNum, 
    totalQuestions, 
    myAnswer, 
    currentPlayer 
  });

  // Extraer la pregunta real de la estructura anidada o directa
  const actualQuestion: Question | null = (() => {
    if (!question) return null;
    
    // Si tiene propiedades question, questionNumber, totalQuestions = estructura anidada
    if ('question' in question && 'questionNumber' in question && 'totalQuestions' in question) {
      console.log('🔧 Detectada estructura anidada, extrayendo pregunta...');
      return (question as QuestionWrapper).question;
    }
    
    // Si tiene propiedades id, question, options = pregunta directa
    if ('id' in question && 'question' in question && 'options' in question) {
      console.log('✅ Detectada pregunta directa');
      return question as Question;
    }
    
    console.error('❌ Estructura de pregunta no reconocida:', Object.keys(question));
    return null;
  })();

  // Reset estados cuando cambia la pregunta
  useEffect(() => {
    setSelectedAnswer('');
    setHasSubmitted(false);
  }, [actualQuestion?.id]);

  // Sincronizar con myAnswer del backend
  useEffect(() => {
    if (myAnswer) {
      setSelectedAnswer(myAnswer);
      setHasSubmitted(true);
    }
  }, [myAnswer]);

  // Verificar disponibilidad de imágenes y obtener nueva imagen cuando cambie la pregunta
  useEffect(() => {
    const loadImage = async () => {
      if (actualQuestion && actualQuestion.id) {
        try {
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
  }, [actualQuestion?.id]);

  // Funciones para manejo de respuestas
  const handleSubmit = () => {
    if (selectedAnswer && !hasSubmitted && timeLeft > 0) {
      setHasSubmitted(true);
      onSubmitAnswer(selectedAnswer);
      console.log('📤 Respuesta enviada:', selectedAnswer);
    }
  };

  const handleChangeAnswer = () => {
    if (timeLeft > 0) {
      setHasSubmitted(false);
      console.log('🔄 Permitiendo cambio de respuesta');
    }
  };

  const handleOptionClick = (optionLetter: string) => {
    if (timeLeft > 0) {
      setSelectedAnswer(optionLetter);
      if (hasSubmitted) {
        setHasSubmitted(false);
      }
      console.log('🎯 Opción seleccionada:', optionLetter);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('❌ Error cargando imagen:', currentImage);
    setImageError(true);
    setImageLoaded(true);
  };

  // Verificación de datos antes de renderizar
  if (!actualQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando pregunta...</p>
          <div className="mt-4 text-sm bg-black/20 p-4 rounded">
            <p>Debug: question = {question ? 'object' : 'null'}</p>
            <p>Debug: question keys = {question ? Object.keys(question).join(', ') : 'none'}</p>
            <p>Debug: actualQuestion = {actualQuestion ? 'extracted' : 'null'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando información del jugador...</p>
        </div>
      </div>
    );
  }

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
              {actualQuestion.question}
            </h2>

            {/* Opciones */}
            <div className="grid grid-cols-1 gap-4">
              {actualQuestion.options && Array.isArray(actualQuestion.options) && actualQuestion.options.length > 0 ? (
                actualQuestion.options.map((option) => (
                  <button
                    key={option.letter}
                    onClick={() => handleOptionClick(option.letter)}
                    disabled={timeLeft <= 0}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                      selectedAnswer === option.letter
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${
                      timeLeft <= 0
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${option.color}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{option.icon}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-lg text-gray-700">{option.letter}.</span>
                        <p className="text-gray-600 mt-1">{option.text}</p>
                      </div>
                      {selectedAnswer === option.letter && (
                        <div className="ml-auto">
                          <CheckCircle className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>No hay opciones disponibles para esta pregunta</p>
                  <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
                    <p>Debug: options = {actualQuestion.options ? 'array length: ' + actualQuestion.options.length : 'null/undefined'}</p>
                    <p>Debug: question id = {actualQuestion.id}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de botones */}
            <div className="mt-8 text-center">
              {!hasSubmitted ? (
                // Primera vez enviando respuesta
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || timeLeft <= 0}
                  className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
                    selectedAnswer && timeLeft > 0
                      ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  📤 Enviar Respuesta
                </button>
              ) : (
                // Ya envió respuesta - mostrar opciones
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold">Respuesta Enviada: {selectedAnswer}</span>
                    </div>
                  </div>
                  
                  {timeLeft > 0 ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleChangeAnswer}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                      >
                        🔄 Cambiar Respuesta ({timeLeft}s restantes)
                      </button>
                      <p className="text-gray-600 text-sm">
                        Puedes cambiar tu respuesta mientras haya tiempo
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 border border-gray-500 rounded-lg p-3">
                      <p className="text-gray-600">⏰ Tiempo agotado - Respuesta final confirmada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              <div className="mt-2 text-center">
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <p>Imagen: {currentImage}</p>
                  <p>Question ID: {actualQuestion?.id || 'N/A'}</p>
                  <p>Player: {currentPlayer?.name || 'N/A'} (Joel: {currentPlayer?.isJoel ? 'Sí' : 'No'})</p>
                  <p>TimeLeft: {timeLeft}</p>
                  <p>Selected: {selectedAnswer}</p>
                  <p>Submitted: {hasSubmitted ? 'Sí' : 'No'}</p>
                  <p>myAnswer (backend): {myAnswer || 'null'}</p>
                  <p>Original question type: {question ? Object.keys(question).join(', ') : 'null'}</p>
                </details>
              </div>
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

        {/* Información del jugador */}
        <div className="text-center mt-6 text-white/70">
          Jugando como: <span className="font-semibold text-white">{currentPlayer?.name}</span>
          {myAnswer && timeLeft <= 0 && (
            <div className="mt-2">
              Respuesta final: <span className="font-semibold text-yellow-300">{myAnswer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;