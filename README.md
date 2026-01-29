# 📚 English Notebook - Backend API

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn" />
</div>

<h1 align="center">🇬🇧 English Notebook - Backend</h1>

<h3 align="center">🎯 Comprehensive English Learning Platform Backend API</h3>

<p align="center">
  RESTful API built with Express.js for a complete English learning ecosystem.<br>
  Featuring multimedia content, AI-powered conversations, gamification, and user progress tracking.
</p>

---

## 🏗️ **Project Structure**

📁 english-notebook-backend/
│
├── 📁 config/ # Configuration files
│ ├── 📄 database.js # MongoDB connection setup
│ ├── 📄 cloudinary.js # Cloudinary media storage config
│ └── 📄 constants.js # Application constants
│
├── 📁 controllers/ # Business logic handlers
│ ├── 📄 auth.controller.js # Authentication logic
│ ├── 📄 user.controller.js # User management
│ ├── 📄 conversation.controller.js # AI conversations
│ ├── 📄 flashcard.controller.js # Vocabulary cards
│ ├── 📄 grammar.controller.js # Grammar exercises
│ ├── 📄 multimedia.controller.js # Songs, movies, texts
│ └── 📄 achievement.controller.js # Gamification system
│
├── 📁 logs/ # Application logs
│ ├── 📄 access.log # HTTP request logs
│ ├── 📄 error.log # Error logs
│ └── 📄 combined.log # Comprehensive logs
│
├── 📁 middleware/ # Custom middleware
│ ├── 📄 auth.middleware.js # JWT authentication
│ ├── 📄 validation.middleware.js # Request validation
│ ├── 📄 error.middleware.js # Error handling
│ ├── 📄 upload.middleware.js # File upload handling
│ └── 📄 rateLimit.middleware.js # Rate limiting
│
├── 📁 models/ # MongoDB schemas and models
│ ├── 📄 User.js # User accounts and profiles
│ ├── 📄 Profile.js # Extended user information
│ ├── 📄 Achievement.js # Gamification achievements
│ ├── 📄 Conversation.js # AI conversation sessions
│ ├── 📄 Message.js # Conversation messages
│ ├── 📄 Flashcard.js # Vocabulary flashcards
│ ├── 📄 Grammar.js # Grammar rules and exercises
│ ├── 📄 Vocabulary.js # Word banks and definitions
│ ├── 📄 Song.js # Lyrics and music learning
│ ├── 📄 Movie.js # Movie scene analysis
│ ├── 📄 Text.js # Reading comprehension
│ ├── 📄 DailyPhrase.js # Daily expressions
│ ├── 📄 IrregularVerb.js # Verb conjugation
│ └── 📄 DailyCommitment.js # Learning streaks
│
├── 📁 routes/ # API route definitions
│ ├── 📄 auth.routes.js # Authentication endpoints
│ ├── 📄 user.routes.js # User management endpoints
│ ├── 📄 conversation.routes.js # Conversation endpoints
│ ├── 📄 learning.routes.js # Learning content endpoints
│ ├── 📄 multimedia.routes.js # Media content endpoints
│ └── 📄 admin.routes.js # Administrative endpoints
│
├── 📁 uploads/ # Temporary file storage
│ ├── 📁 avatars/ # User profile pictures
│ ├── 📁 audio/ # Pronunciation audio files
│ ├── 📁 documents/ # Learning materials
│ └── 📁 temp/ # Temporary uploads
│
├── 📁 utils/ # Helper functions and utilities
│ ├── 📄 errorHandler.js # Custom error handling
│ ├── 📄 responseHandler.js # API response formatting
│ ├── 📄 fileProcessor.js # File upload processing
│ ├── 📄 validator.js # Data validation utilities
│ ├── 📄 logger.js # Enhanced logging
│ └── 📄 helpers.js # General helper functions
│
├── 📄 .env # Environment variables
├── 📄 .env.example # Environment template
├── 📄 .gitignore # Git ignore rules
├── 📄 app.js # Express app configuration
├── 📄 server.js # Server initialization
├── 📄 package.json # Dependencies and scripts
├── 📄 package-lock.json # Dependency lock file
└── 📄 test-connection.js # Database connection test
