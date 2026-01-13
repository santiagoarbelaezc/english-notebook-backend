const mongoose = require('mongoose');

const grammarSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Regla gramatical
    title: {
      type: String,
      required: [true, 'El título de la regla es requerido'],
      trim: true
    },

    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true
    },

    // Explicación detallada
    explanation: {
      type: String,
      required: true
    },

    // Uso y estructura
    structure: {
      type: String,
      description: 'Formato/estructura de la regla (ej: Subject + Verb + Object)'
    },

    // Palabras subrayadas con color
    highlightedWords: [
      {
        word: {
          type: String,
          required: true
        },
        color: {
          type: String,
          required: true,
          description: 'Color del subrayado (hex o nombre: red, blue, yellow, green, purple, orange, pink)'
        },
        _id: false
      }
    ],

    // Ejemplos
    examples: [
      {
        correct: {
          type: String,
          required: true
        },
        incorrect: {
          type: String,
          default: ''
        },
        explanation: {
          type: String,
          default: ''
        },
        _id: false
      }
    ],

    // Nivel de dificultad
    difficulty: {
      type: String,
      enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
      default: 'beginner'
    },

    // Categoría gramatical
    category: {
      type: String,
      enum: [
        'tenses',
        'verbs',
        'nouns',
        'adjectives',
        'adverbs',
        'pronouns',
        'prepositions',
        'conditionals',
        'passive-voice',
        'word-order',
        'articles',
        'other'
      ],
      required: true
    },

    // Palabras clave relacionadas
    relatedVocabulary: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vocabulary'
      }
    ],

    // Marcadores
    isFavorite: {
      type: Boolean,
      default: false
    },

    // Notas personales
    notes: {
      type: String,
      maxlength: [1000, 'Las notas no deben exceder 1000 caracteres'],
      default: ''
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
grammarSchema.index({ user: 1 });
grammarSchema.index({ category: 1 });
grammarSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Grammar', grammarSchema);
