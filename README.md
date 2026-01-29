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


---

## 🔧 **Technology Stack**

### **Backend Framework**
<div align="center">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</div>

### **Database & Storage**
<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</div>

### **Security & Authentication**
<div align="center">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/BCrypt-003A70?style=for-the-badge&logo=bcrypt&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=cors&logoColor=white" />
</div>

### **Utilities & Tools**
<div align="center">
  <img src="https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Multer-F46519?style=for-the-badge&logo=multer&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Morgan-000000?style=for-the-badge&logo=morgan&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Helmet-000000?style=for-the-badge&logo=helmet&logoColor=white" />
</div>

---

## 📊 **Database Models Overview**

### **👤 User Management Models**
| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | User authentication and core data | `email`, `password`, `role`, `status` |
| **Profile** | Extended user information | `userId`, `level`, `streak`, `totalPoints` |
| **Achievement** | Gamification rewards | `userId`, `badge`, `points`, `unlockedAt` |

### **💬 Learning Content Models**
| Model | Description | Key Fields |
|-------|-------------|------------|
| **Conversation** | AI dialogue sessions | `userId`, `topic`, `difficulty`, `messages` |
| **Message** | Individual chat messages | `conversationId`, `content`, `sender`, `timestamp` |
| **Flashcard** | Vocabulary cards | `userId`, `front`, `back`, `category`, `reviewCount` |
| **Grammar** | Grammar exercises | `topic`, `rules`, `examples`, `exercises` |
| **Vocabulary** | Word collections | `word`, `definition`, `pronunciation`, `examples` |

### **🎵 Multimedia Learning Models**
| Model | Description | Key Fields |
|-------|-------------|------------|
| **Song** | Music-based learning | `title`, `artist`, `lyrics`, `vocabularyList` |
| **Movie** | Film scene analysis | `title`, `scene`, `transcript`, `difficulty` |
| **Text** | Reading comprehension | `title`, `content`, `questions`, `level` |
| **DailyPhrase** | Daily expressions | `phrase`, `meaning`, `examples`, `date` |

### **📈 Progress Tracking Models**
| Model | Description | Key Fields |
|-------|-------------|------------|
| **DailyCommitment** | Learning streaks | `userId`, `date`, `completed`, `duration` |
| **IrregularVerb** | Verb conjugation | `baseForm`, `pastSimple`, `pastParticiple` |

---

## 🚀 **Key Features**

### **🔐 Authentication System**
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (User, Admin, Premium)
- **Secure password hashing** with bcrypt
- **Session management** and token blacklisting

### **📱 User Management**
- **Complete CRUD operations** for user profiles
- **Progress tracking** and learning statistics
- **Achievement system** with badges and rewards
- **Daily commitment tracking** and streaks

### **🎓 Learning Modules**
- **AI-powered conversation** simulations
- **Smart flashcard system** with spaced repetition
- **Interactive grammar** exercises with explanations
- **Multimedia content** (songs, movies, texts) analysis

### **☁️ File Management**
- **Image upload** to Cloudinary for user profiles
- **Audio file handling** for pronunciation practice
- **PDF/text processing** for learning materials
- **Automatic file cleanup** and optimization

---

## 🌐 **API Endpoints Summary**

### **Authentication & User Management**
