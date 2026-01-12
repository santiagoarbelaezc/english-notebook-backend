const mongoose = require('mongoose');
const logger = require('../utils/logger');

class Database {
  constructor() {
    // No conectar automáticamente en el constructor
    // La conexión se iniciará desde server.js
  }

  async connect() {
    try {
      logger.info('🔄 Iniciando conexión a MongoDB Atlas...');
      logger.info('📍 Verificando configuración de conexión...');
      
      // Verificar que la URI existe
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
      }
      
      logger.info('🔍 URI de MongoDB encontrada');
      logger.debug(`🌐 Host: ${this.extractHostFromURI(MONGODB_URI)}`);
      
      // Configurar opciones optimizadas para MongoDB Atlas
      const options = {
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 10000,
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        w: 'majority'
      };

      logger.info('⚙️ Configurando conexión con opciones:');
      logger.info(`⏱️  Timeout de conexión: ${options.serverSelectionTimeoutMS}ms`);
      logger.info(`🔌 Timeout de socket: ${options.socketTimeoutMS}ms`);
      
      // Iniciar conexión
      const startTime = Date.now();
      logger.info('🔗 Estableciendo conexión con MongoDB Atlas...');
      
      const conn = await mongoose.connect(MONGODB_URI, options);
      const connectionTime = Date.now() - startTime;
      
      // Log de conexión exitosa
      logger.info('✅ CONEXIÓN EXITOSA A MONGODB ATLAS!');
      logger.info(`🏁 Tiempo de conexión: ${connectionTime}ms`);
      logger.info(`📍 Host: ${conn.connection.host}`);
      logger.info(`📊 Base de datos: ${conn.connection.name}`);
      logger.info(`👤 Usuario: arbelaezzc11_db_user`);
      logger.info(`🔑 Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
      
      // Mostrar colecciones disponibles
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info(`📚 Colecciones disponibles (${collections.length}):`);
      collections.forEach((col, index) => {
        logger.info(`  ${index + 1}. ${col.name}`);
      });

      // Event listeners con logs detallados (solo si no están ya registrados)
      if (!this.listenersRegistered) {
        mongoose.connection.on('connected', () => {
          logger.info('✅ Mongoose conectado exitosamente a la base de datos');
          logger.info('📈 Estadísticas de conexión:');
          logger.info(`   Estado: ${mongoose.connection.readyState}`);
          logger.info(`   DB Name: ${mongoose.connection.name}`);
          logger.info(`   Host: ${mongoose.connection.host}`);
        });

        mongoose.connection.on('error', (err) => {
          logger.error('❌ ERROR DE CONEXIÓN MONGODB:');
          logger.error(`   Mensaje: ${err.message}`);
          logger.error(`   Código: ${err.code}`);
          logger.error(`   Stack: ${err.stack}`);
          
          // Intentar reconexión automática
          logger.info('🔄 Intentando reconexión automática en 5 segundos...');
          setTimeout(() => {
            if (mongoose.connection.readyState === 0) {
              logger.info('🔄 Reconectando...');
              this.connect();
            }
          }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
          logger.warn('⚠️  Mongoose se desconectó de MongoDB Atlas');
          logger.warn('🔌 Posibles causas:');
          logger.warn('   - Problemas de red');
          logger.warn('   - Timeout de conexión');
          logger.warn('   - Servidor MongoDB no disponible');
        });

        mongoose.connection.on('reconnected', () => {
          logger.info('🔄 Mongoose reconectado exitosamente');
        });

        this.listenersRegistered = true;
      }

      // Configurar apagado graceful
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('❌ ERROR CRÍTICO AL CONECTAR A MONGODB ATLAS:');
      logger.error(`📛 Nombre del error: ${error.name}`);
      logger.error(`📝 Mensaje: ${error.message}`);
      
      if (error.code) {
        logger.error(`🔢 Código de error: ${error.code}`);
      }
      
      if (error.code === 'ENOTFOUND') {
        logger.error('🌐 ERROR DE RED: No se pudo resolver el host de MongoDB Atlas');
        logger.error('💡 Solución: Verifica tu conexión a internet');
      } else if (error.code === 'ETIMEDOUT') {
        logger.error('⏱️  ERROR DE TIMEOUT: La conexión tardó demasiado');
        logger.error('💡 Solución: Verifica la red o incrementa el timeout');
      } else if (error.message.includes('auth failed')) {
        logger.error('🔐 ERROR DE AUTENTICACIÓN: Usuario o contraseña incorrectos');
        logger.error('💡 Solución: Verifica las credenciales en el .env');
      } else if (error.message.includes('bad auth')) {
        logger.error('🔐 ERROR: Autenticación fallida');
        logger.error('💡 Verifica:');
        logger.error('   1. El usuario existe en MongoDB Atlas');
        logger.error('   2. La contraseña es correcta');
        logger.error('   3. El usuario tiene permisos de lectura/escritura');
      }
      
      logger.error('🔧 Debug info:');
      logger.error(`   NODE_ENV: ${process.env.NODE_ENV}`);
      logger.error(`   URI length: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 'undefined'}`);
      
      // Intentar reconexión
      logger.info('🔄 Intentando reconexión automática en 10 segundos...');
      setTimeout(() => {
        logger.info('🔄 Iniciando reconexión...');
        this.connect();
      }, 10000);
    }
  }

  // Método para extraer el host de la URI (sin exponer credenciales)
  extractHostFromURI(uri) {
    try {
      const match = uri.match(/@([^/]+)/);
      return match ? match[1] : 'Host no encontrado';
    } catch {
      return 'Error parsing URI';
    }
  }

  setupGracefulShutdown() {
    // Cerrar conexión al salir
    process.on('SIGINT', async () => {
      logger.info('👋 SIGINT recibido. Cerrando conexión a MongoDB...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('👋 SIGTERM recibido. Cerrando conexión a MongoDB...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('exit', () => {
      logger.info('👋 Proceso terminado');
    });
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState !== 0) {
        logger.info('🔌 Cerrando conexión a MongoDB...');
        await mongoose.connection.close();
        logger.info('✅ Conexión a MongoDB cerrada exitosamente');
      }
    } catch (error) {
      logger.error(`❌ Error cerrando conexión: ${error.message}`);
    }
  }

  // Método para verificar estado de conexión
  getConnectionStatus() {
    const states = {
      0: 'Desconectado',
      1: 'Conectado',
      2: 'Conectando',
      3: 'Desconectando'
    };
    return {
      state: states[mongoose.connection.readyState] || 'Desconocido',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0
    };
  }
}

// Exportar instancia única
module.exports = new Database();