const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    // Referencia al usuario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // Foto de perfil (URL de Cloudinary)
    profileImage: {
      type: String,
      default: null
    },

    // Información adicional
    bio: {
      type: String,
      maxlength: [500, 'La biografía no debe exceder 500 caracteres'],
      default: ''
    },

    // Información adicional
    nativeLanguage: {
      type: String,
      default: 'Spanish'
    },

    // Experiencia y nivel
    experience: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },

    // Estadísticas
    statistics: {
      totalVocabulary: {
        type: Number,
        default: 0
      },
      totalGrammarRules: {
        type: Number,
        default: 0
      },
      totalConversations: {
        type: Number,
        default: 0
      },
      totalSongs: {
        type: Number,
        default: 0
      },
      totalTexts: {
        type: Number,
        default: 0
      },
      totalMovies: {
        type: Number,
        default: 0
      },
      totalFlashcards: {
        type: Number,
        default: 0
      },
      totalIrregularVerbs: {
        type: Number,
        default: 0
      },
      streakDays: {
        type: Number,
        default: 0
      },
      longestStreak: {
        type: Number,
        default: 0
      },
      lastLoginDate: {
        type: Date,
        default: null
      },
      lastActiveDate: {
        type: Date,
        default: Date.now
      }
    },

    // Auditoría
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Índices
profileSchema.index({ user: 1 });

module.exports = mongoose.model('Profile', profileSchema);
