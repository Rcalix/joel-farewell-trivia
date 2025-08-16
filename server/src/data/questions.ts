export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  icon: string;
  color: string;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  joelAnswer: 'A' | 'B' | 'C' | 'D' | null;
  options: QuestionOption[];
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question: "¿Cuál es su serie de anime favorita según él dice vs. la realidad?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Dice Psycho Pass pero en secreto ve waifus slice of life", icon: "👁️", color: "bg-rose-100" },
      { letter: "B", text: "Attack on Titan pero solo para parecer intelectual", icon: "⚔️", color: "bg-blue-100" },
      { letter: "C", text: "Death Note mientras planea conquistar el mundo con ajedrez", icon: "📔", color: "bg-purple-100" },
      { letter: "D", text: "One Piece porque nunca termina como sus proyectos musicales", icon: "🏴‍☠️", color: "bg-orange-100" }
    ]
  },
  {
    id: 2,
    question: "¿Cuál es su opening favorito que tararea en la ducha?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Empate entre Psycho Pass y GTO mientras se jabona filosóficamente", icon: "🎵", color: "bg-pink-100" },
      { letter: "B", text: "Naruto pero versión karaoke desafinado de las 6am", icon: "🍜", color: "bg-yellow-100" },
      { letter: "C", text: "Death Note susurrado como villano que planea algo", icon: "🎼", color: "bg-gray-100" },
      { letter: "D", text: "Dragon Ball Z gritando como Goku con eco en azulejo", icon: "⚡", color: "bg-green-100" }
    ]
  },
  {
    id: 3,
    question: "¿Qué frase filosófica dice SIEMPRE hasta el hartazgo?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Diferente a la diferencia e igual a la igualdad", icon: "🤔", color: "bg-indigo-100" },
      { letter: "B", text: "La vida es como el ajedrez pero yo juego en 4D", icon: "🎲", color: "bg-teal-100" },
      { letter: "C", text: "Todo es relativo excepto mi nivel de ajedrez", icon: "🧠", color: "bg-lime-100" },
      { letter: "D", text: "Existir es resistir... pero en coreano suena mejor", icon: "📱", color: "bg-red-100" }
    ]
  },
  {
    id: 4,
    question: "¿Cuál es su manía más divertida?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Ser amigo del Mali desde el colegio (síndrome de Estocolmo catracho)", icon: "👫", color: "bg-cyan-100" },
      { letter: "B", text: "Explicar estrategias de ajedrez en situaciones random", icon: "♟️", color: "bg-amber-100" },
      { letter: "C", text: "Corregir pronunciación de anime como sensei autodidacta", icon: "📚", color: "bg-emerald-100" },
      { letter: "D", text: "Practicar frases en coreano para impresionar en TikTok", icon: "🇰🇷", color: "bg-violet-100" }
    ]
  },
  {
    id: 5,
    question: "¿Qué hace cuando está aburrido y nadie lo ve?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Jugar ajedrez contra sí mismo y hacer trampa para ganar", icon: "♟️", color: "bg-slate-100" },
      { letter: "B", text: "Tocar guitarra imaginando que está en el Nacional", icon: "🎸", color: "bg-red-100" },
      { letter: "C", text: "Practicar coreano con videos de K-pop hasta las 3am", icon: "🗣️", color: "bg-orange-100" },
      { letter: "D", text: "Stalkear a ex compañeros de la U en LinkedIn", icon: "💼", color: "bg-yellow-100" }
    ]
  },
  {
    id: 6,
    question: "¿Qué mentira más obvia dice siempre?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Que es buenísimo con Lulu (nadie lo ha visto jugar jamás)", icon: "🎮", color: "bg-purple-100" },
      { letter: "B", text: "Que los spoilers no le importan (llora por dentro)", icon: "😭", color: "bg-blue-100" },
      { letter: "C", text: "Que no stalkea a sus ex en redes sociales", icon: "👀", color: "bg-green-100" },
      { letter: "D", text: "Que entiende completamente el final de Evangelion", icon: "🤯", color: "bg-pink-100" }
    ]
  },
  {
    id: 7,
    question: "La épica jugada 'pinede' en Fridays: ¿qué desastre causó?",
    joelAnswer: "A",
    options: [
      { letter: "A", text: "Quebró un bote de chile que olía a muerte y caos", icon: "🌶️", color: "bg-red-100" },
      { letter: "B", text: "Resbaló tan épicamente que se volvió meme local", icon: "🤸", color: "bg-yellow-100" },
      { letter: "C", text: "Intentó ligar y terminó pidiendo perdón", icon: "💔", color: "bg-amber-100" },
      { letter: "D", text: "Gastó dinero que no tenía en impresionar", icon: "💸", color: "bg-violet-100" }
    ]
  },
  {
    id: 8,
    question: "¿Cuál es el apodo más ridículo que ha tenido?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Joelito (diminutivo que odia pero acepta)", icon: "😅", color: "bg-pink-100" },
      { letter: "B", text: "El Wannabe Coreano de Tegus", icon: "🇰🇷", color: "bg-indigo-100" },
      { letter: "C", text: "Sensei del Fail (por explicar mal el anime)", icon: "📚", color: "bg-blue-100" },
      { letter: "D", text: "Guitar Zero (opuesto a Guitar Hero)", icon: "🎸", color: "bg-orange-100" }
    ]
  },
  {
    id: 9,
    question: "¿Qué excusa usa cuando pierde en ajedrez?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Estaba pensando en música, no me concentré", icon: "🎵", color: "bg-green-100" },
      { letter: "B", text: "Mi oponente jugó de forma poco elegante", icon: "🌶️", color: "bg-red-100" },
      { letter: "C", text: "Estaba probando una estrategia experimental", icon: "🧪", color: "bg-blue-100" },
      { letter: "D", text: "El tablero no estaba alineado con mi chakra", icon: "🧘", color: "bg-purple-100" }
    ]
  },
  {
    id: 10,
    question: "¿Cómo toma su café en Tegucigalpa?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Hipster en cafés de Paseo para las fotos de Instagram", icon: "☕", color: "bg-amber-100" },
      { letter: "B", text: "Solo, amargo, como su humor existencial", icon: "😤", color: "bg-gray-100" },
      { letter: "C", text: "Con leche deslactosada porque descubrió el wellness", icon: "🥛", color: "bg-green-100" },
      { letter: "D", text: "Nescafé en casa porque es lo que hay", icon: "💰", color: "bg-yellow-100" }
    ]
  },
  {
    id: 11,
    question: "¿Dónde vive según él vs. la realidad en Tegus?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Dice: zona exclusiva. Realidad: colonia normal", icon: "🏠", color: "bg-blue-100" },
      { letter: "B", text: "Dice: cerca del centro cultural. Realidad: cerca del Super Lider", icon: "🏭", color: "bg-gray-100" },
      { letter: "C", text: "Dice: espacio minimalista. Realidad: cuarto lleno de cables", icon: "👥", color: "bg-orange-100" },
      { letter: "D", text: "Dice: como en series coreanas. Realidad: casa típica catracha", icon: "🎬", color: "bg-red-100" }
    ]
  },
  {
    id: 12,
    question: "¿A qué hora es más productivo según él?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "5am porque vio un video de productividad en YouTube", icon: "⏰", color: "bg-yellow-100" },
      { letter: "B", text: "3am componiendo música que nadie va a escuchar", icon: "🎵", color: "bg-indigo-100" },
      { letter: "C", text: "12pm después de 5 tazas de café hondureño", icon: "☕", color: "bg-brown-100" },
      { letter: "D", text: "Nunca, pero dice que está en proceso", icon: "🔄", color: "bg-purple-100" }
    ]
  },
  {
    id: 13,
    question: "¿Qué podcast finge que escucha para sonar intelectual?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "De filosofía existencial para sonar profundo", icon: "🤔", color: "bg-purple-100" },
      { letter: "B", text: "De emprendimiento (no entiende ni la mitad)", icon: "💼", color: "bg-blue-100" },
      { letter: "C", text: "De análisis cultural de K-pop para encajar", icon: "🎧", color: "bg-pink-100" },
      { letter: "D", text: "De autoayuda mientras su vida es un desastre", icon: "📈", color: "bg-green-100" }
    ]
  },
  {
    id: 14,
    question: "¿Qué idiomas dice que domina vs. la realidad?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Coreano avanzado + señas desesperadas", icon: "👐", color: "bg-green-100" },
      { letter: "B", text: "Inglés fluido + español con work in progress", icon: "🗣️", color: "bg-blue-100" },
      { letter: "C", text: "Google Translate en modo experto", icon: "📱", color: "bg-red-100" },
      { letter: "D", text: "Lenguaje corporal de confusión universal", icon: "🤷", color: "bg-purple-100" }
    ]
  },
  {
    id: 15,
    question: "¿A quién stalkea más en redes sociales?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "YouTubers coreanos hasta memorizar sus horarios", icon: "📺", color: "bg-red-100" },
      { letter: "B", text: "Compañeros de la U para ver quién ya se graduó", icon: "🌍", color: "bg-blue-100" },
      { letter: "C", text: "Ex-novias para ver si están mejor sin él", icon: "📸", color: "bg-green-100" },
      { letter: "D", text: "Nosotros para ver si hablamos de él", icon: "💔", color: "bg-pink-100" }
    ]
  },
  {
    id: 16,
    question: "¿Cuál es su crisis existencial más recurrente?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "¿Por qué no soy tan genial como pienso?", icon: "💡", color: "bg-yellow-100" },
      { letter: "B", text: "¿Por qué el Mali me aguanta tanto?", icon: "👶", color: "bg-baby-100" },
      { letter: "C", text: "¿Debería haber estudiado algo más práctico?", icon: "😭", color: "bg-blue-100" },
      { letter: "D", text: "¿Por qué nadie entiende mis referencias filosóficas?", icon: "🤯", color: "bg-purple-100" }
    ]
  },
  {
    id: 17,
    question: "¿Qué es lo que más extraña de su infancia en Honduras?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Cuando pensaba que ser adulto iba a ser fácil", icon: "👑", color: "bg-gold-100" },
      { letter: "B", text: "Los sábados de caricaturas sin responsabilidades", icon: "🎭", color: "bg-gray-100" },
      { letter: "C", text: "Cuando sus papás le resolvían todo", icon: "🗣️", color: "bg-red-100" },
      { letter: "D", text: "Las baleadas de la esquina a 5 pesos", icon: "🌮", color: "bg-orange-100" }
    ]
  },
  {
    id: 18,
    question: "¿Cuál es su mecanismo de defensa favorito?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Cambiar de tema hacia anime o ajedrez", icon: "🌍", color: "bg-green-100" },
      { letter: "B", text: "Decir que es parte de su proceso artístico", icon: "🎨", color: "bg-pink-100" },
      { letter: "C", text: "Filosofar sobre por qué todo pasa por algo", icon: "📿", color: "bg-purple-100" },
      { letter: "D", text: "Mandar memes al chat para evitar conversaciones serias", icon: "📱", color: "bg-blue-100" }
    ]
  },
  {
    id: 19,
    question: "¿Con qué excusa justifica no hacer ejercicio?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Estoy enfocado en ejercitar la mente, no el cuerpo", icon: "🎎", color: "bg-red-100" },
      { letter: "B", text: "Mi energía está reservada para proyectos creativos", icon: "🧠", color: "bg-indigo-100" },
      { letter: "C", text: "Estoy esperando encontrar el gym perfecto", icon: "🔓", color: "bg-yellow-100" },
      { letter: "D", text: "Los músculos interfieren con tocar guitarra", icon: "🎩", color: "bg-gray-100" }
    ]
  },
  {
    id: 20,
    question: "¿Cuál es su post más cringe de Instagram?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Foto pensativo con quote profundo que encontró en Pinterest", icon: "📸", color: "bg-pink-100" },
      { letter: "B", text: "Selfie con guitarra: 'Music is my passion'", icon: "☕", color: "bg-brown-100" },
      { letter: "C", text: "Sunset con caption sobre new chapters en su vida", icon: "🌅", color: "bg-orange-100" },
      { letter: "D", text: "Comida coreana + 'Exploring new cultures'", icon: "🍜", color: "bg-red-100" }
    ]
  },
  {
    id: 21,
    question: "¿Qué le dice a su familia cuando preguntan por su situación laboral?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Estoy explorando oportunidades (traducción: sin trabajo)", icon: "😅", color: "bg-green-100" },
      { letter: "B", text: "Estoy enfocado en mi crecimiento personal", icon: "🦋", color: "bg-purple-100" },
      { letter: "C", text: "Todo está bajo control según mi plan maestro", icon: "📋", color: "bg-blue-100" },
      { letter: "D", text: "*cambia de tema* ¿Ya vieron mi nueva canción?", icon: "👻", color: "bg-gray-100" }
    ]
  },
  {
    id: 22,
    question: "¿Cuál fue su compra más innecesaria del año?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Curso online de productividad que nunca terminó", icon: "🧴", color: "bg-pink-100" },
      { letter: "B", text: "Ropa 'aesthetic' que usó una vez", icon: "👔", color: "bg-indigo-100" },
      { letter: "C", text: "Gadget musical que prometía revolucionar su sound", icon: "📱", color: "bg-blue-100" },
      { letter: "D", text: "Suscripción premium a app que olvidó cancelar", icon: "🎸", color: "bg-red-100" }
    ]
  },
  {
    id: 23,
    question: "¿Cómo intenta impresionar en una primera cita?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Llevándola a un café 'intelectual' para hablar de filosofía", icon: "♟️", color: "bg-brown-100" },
      { letter: "B", text: "Explicando la complejidad narrativa de su anime favorito", icon: "📺", color: "bg-orange-100" },
      { letter: "C", text: "Tocando guitarra acústica en el parque", icon: "🌮", color: "bg-yellow-100" },
      { letter: "D", text: "Hablando de sus planes de viajar por el mundo", icon: "💬", color: "bg-purple-100" }
    ]
  },
  {
    id: 24,
    question: "¿Cuál es la mentira que más se dice a sí mismo?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Mañana definitivamente empiezo mi rutina perfecta", icon: "⏳", color: "bg-blue-100" },
      { letter: "B", text: "Solo necesito el momento perfecto para ser exitoso", icon: "💪", color: "bg-green-100" },
      { letter: "C", text: "Estoy adelantado a mi tiempo, por eso no me entienden", icon: "👥", color: "bg-red-100" },
      { letter: "D", text: "Todo está saliendo exactamente como lo planeé", icon: "🤷", color: "bg-purple-100" }
    ]
  },
  {
    id: 25,
    question: "¿Cuál es su momento más vergonzoso en público?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Cuando cantó karaoke y desafinó épicamente", icon: "🐟", color: "bg-blue-100" },
      { letter: "B", text: "Cuando trató de ligar en japonés y era coreano", icon: "💰", color: "bg-yellow-100" },
      { letter: "C", text: "La vez que se cayó caminando mientras textea", icon: "🗺️", color: "bg-green-100" },
      { letter: "D", text: "Cuando le explicó anime a alguien que resultó ser otaku experto", icon: "😰", color: "bg-red-100" }
    ]
  },
  {
    id: 26,
    question: "¿Qué hace a las 3am cuando no puede dormir?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Escribir letras de canciones que nunca va a terminar", icon: "📱", color: "bg-blue-100" },
      { letter: "B", text: "Ver videos de filosofía oriental en YouTube", icon: "👀", color: "bg-purple-100" },
      { letter: "C", text: "Planear su vida ideal en detalle obsesivo", icon: "😂", color: "bg-yellow-100" },
      { letter: "D", text: "Stalkear perfiles de gente exitosa en LinkedIn", icon: "✈️", color: "bg-green-100" }
    ]
  },
  {
    id: 27,
    question: "¿Cuál es su historia más exagerada que cuenta en fiestas?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Como casi se vuelve famoso por un cover en YouTube", icon: "⭐", color: "bg-pink-100" },
      { letter: "B", text: "Como ganó un torneo de ajedrez (era torneo local de 8 personas)", icon: "🗣️", color: "bg-blue-100" },
      { letter: "C", text: "Como sobrevivió una semana solo con ramen", icon: "🌶️", color: "bg-red-100" },
      { letter: "D", text: "Como casi aparece en un comercial (era casting masivo)", icon: "🎬", color: "bg-purple-100" }
    ]
  },
  {
    id: 28,
    question: "¿Qué pregunta hace más en conversaciones?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "¿Has visto [anime obscuro que nadie conoce]?", icon: "🌍", color: "bg-green-100" },
      { letter: "B", text: "¿Sabés jugar ajedrez? Te puedo enseñar", icon: "🔥", color: "bg-red-100" },
      { letter: "C", text: "¿Conocés música coreana independiente?", icon: "💵", color: "bg-yellow-100" },
      { letter: "D", text: "¿Qué pensás sobre la existencia humana?", icon: "🐌", color: "bg-blue-100" }
    ]
  },
  {
    id: 29,
    question: "¿Cuál es su personalidad en redes sociales vs. vida real?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Online: influencer filosófico. Real: overthinking constante", icon: "🎭", color: "bg-purple-100" },
      { letter: "B", text: "Online: músico profesional. Real: toca guitarra en el cuarto", icon: "📺", color: "bg-orange-100" },
      { letter: "C", text: "Online: viajero del mundo. Real: no sale de Tegus", icon: "🎵", color: "bg-pink-100" },
      { letter: "D", text: "Online: guru del ajedrez. Real: pierde contra el CPU", icon: "🤔", color: "bg-gray-100" }
    ]
  },
  {
    id: 30,
    question: "¿Qué nos manda al chat grupal que más nos divierte?",
    joelAnswer: null,
    options: [
      { letter: "A", text: "Memes filosóficos que solo él entiende", icon: "🍱", color: "bg-red-100" },
      { letter: "B", text: "Screenshots de sus puntuajes de ajedrez online", icon: "📱", color: "bg-blue-100" },
      { letter: "C", text: "Videos de él tocando covers desafinados", icon: "🎥", color: "bg-purple-100" },
      { letter: "D", text: "Audios de 5 minutos explicando teorías conspirativas", icon: "🎙️", color: "bg-yellow-100" }
    ]
  }
];