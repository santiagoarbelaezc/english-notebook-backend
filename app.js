const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Importar middleware
const { errorHandler } = require('./middleware/error.middleware');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const conversationRoutes = require('./routes/conversation.routes');
const vocabularyRoutes = require('./routes/vocabulary.routes');
const profileRoutes = require('./routes/profile.routes');
const songRoutes = require('./routes/song.routes');
const grammarRoutes = require('./routes/grammar.routes');
const textRoutes = require('./routes/text.routes');
const achievementRoutes = require('./routes/achievement.routes');

// Middleware básicos
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📘 Bienvenido a English Notebook API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      profiles: '/api/profiles',
      conversations: '/api/conversations',
      vocabulary: '/api/vocabulary',
      songs: '/api/songs',
      grammar: '/api/grammar',
      texts: '/api/texts',
      achievements: '/api/achievements'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/texts', textRoutes);
app.use('/api/achievements', achievementRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de errores
app.use(errorHandler);

module.exports = app;