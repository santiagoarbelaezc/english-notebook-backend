module.exports = {
  // Roles de usuario
  USER_ROLES: {
    STUDENT: 'student',
    PREMIUM: 'premium',
    ADMIN: 'admin'
  },

  // Niveles de idioma
  LANGUAGE_LEVELS: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced', 'proficient'],

  // Tipos de contenido
  CONTENT_TYPES: {
    VOCABULARY: 'vocabulary',
    GRAMMAR: 'grammar',
    CONVERSATION: 'conversation',
    TEXT: 'text',
    SONG: 'song',
    PHRASE: 'phrase'
  },

  // Categorías de vocabulario
  VOCAB_CATEGORIES: [
    'noun', 'verb', 'adjective', 'adverb', 
    'pronoun', 'preposition', 'conjunction', 
    'interjection', 'phrase', 'idiom', 'phrasal-verb'
  ],

  // Dificultades
  DIFFICULTY_LEVELS: {
    VERY_EASY: 1,
    EASY: 2,
    MEDIUM: 3,
    HARD: 4,
    VERY_HARD: 5
  },

  // Estados
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
  },

  // Límites
  LIMITS: {
    VOCABULARY_PER_DAY: 50,
    MESSAGES_PER_CONVERSATION: 1000,
    PROFILES_PER_USER: 10,
    FILE_SIZE: 5 * 1024 * 1024, // 5MB
    IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Logros
  ACHIEVEMENT_TYPES: {
    STREAK: 'streak',
    VOCABULARY: 'vocabulary',
    CONVERSATION: 'conversation',
    GRAMMAR: 'grammar',
    DAILY: 'daily',
    MILESTONE: 'milestone'
  },

  // Respuestas HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  },

  // Mensajes de error comunes
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'No autorizado. Por favor inicie sesión.',
    FORBIDDEN: 'No tiene permisos para realizar esta acción.',
    NOT_FOUND: 'Recurso no encontrado.',
    VALIDATION_ERROR: 'Error de validación.',
    SERVER_ERROR: 'Error interno del servidor.',
    DUPLICATE: 'El recurso ya existe.'
  }
};