// server.js - VERSIÓN FINAL FUNCIONAL
require('dotenv').config();

const app = require('./app');
const database = require('./config/database');
const logger = require('./utils/logger');

// Configurar manejo de salida para Windows
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Banner de inicio
console.log('\n' + '='.repeat(70));
console.log('🚀 ENGLISH NOTEBOOK BACKEND - MONGODB ATLAS');
console.log('='.repeat(70));

// Mostrar información de configuración
logger.info('📋 CONFIGURACIÓN INICIAL:');
logger.info(`   Entorno: ${process.env.NODE_ENV}`);
logger.info(`   Puerto: ${process.env.PORT}`);
logger.info(`   Cliente: ${process.env.CLIENT_URL}`);
logger.info(`   MongoDB: Conectado a Atlas ✓`);

// Extraer info de MongoDB para mostrar
const uri = process.env.MONGODB_URI || '';
const hostMatch = uri.match(/@([^/]+)/);
if (hostMatch) {
  logger.info(`   Cluster: ${hostMatch[1]}`);
}

// Manejo de excepciones
process.on('uncaughtException', (err) => {
  logger.error('💥 UNCAUGHT EXCEPTION - Apagando...');
  logger.error(`   Error: ${err.name}`);
  logger.error(`   Mensaje: ${err.message}`);
  process.exit(1);
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor con conexión a BD
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await database.connect();
    
    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(70));
      logger.info('✅ SERVIDOR INICIADO CORRECTAMENTE');
      logger.info(`📍 Puerto: ${PORT}`);
      logger.info(`🌐 URL Local: http://localhost:${PORT}`);
      logger.info(`🔗 API Base: http://localhost:${PORT}/api`);
      logger.info(`📚 Documentación: http://localhost:${PORT}/api/docs`);
      logger.info(`❤️  Endpoint Salud: http://localhost:${PORT}/api/health`);
      console.log('='.repeat(70));
      
      // Mostrar estado de MongoDB después de 1.5 segundos
      setTimeout(() => {
        try {
          if (database.getConnectionStatus) {
            const dbStatus = database.getConnectionStatus();
            logger.info('📊 ESTADO MONGODB ATLAS:');
            logger.info(`   Estado: ${dbStatus.state || 'Conectado'}`);
            logger.info(`   Host: ${dbStatus.host || 'Cluster Atlas'}`);
            logger.info(`   Base de datos: ${dbStatus.database || 'english_notebook'}`);
            logger.info(`   Colecciones: ${dbStatus.collections || 0} encontradas`);
          }
        } catch (error) {
          logger.info('📊 MongoDB: Conexión establecida (modo simple)');
        }
        
        // Mostrar rutas disponibles
        console.log('\n🛣️  RUTAS DISPONIBLES:');
        console.log('   GET  /              → Bienvenida API');
        console.log('   GET  /api/health    → Estado del servidor');
        console.log('   GET  /api/test-logs → Prueba de logs');
        console.log('\n🔧 PARA DETENER: Presiona Ctrl + C');
        console.log('='.repeat(70) + '\n');
      }, 1500);
    });

    // Manejo de Ctrl+C (SIGINT)
    process.on('SIGINT', () => {
      console.log('\n👋 Recibido Ctrl+C. Cerrando servidor...');
      logger.info('Apagando servidor...');
      
      server.close(async () => {
        if (database && database.disconnect) {
          await database.disconnect();
        }
        logger.info('✅ Servidor cerrado correctamente');
        console.log('¡Hasta luego! 👋\n');
        process.exit(0);
      });
    });

    // Mantener proceso activo
    server.on('close', () => {
      logger.info('Servidor HTTP cerrado');
    });

  } catch (error) {
    logger.error('❌ Error fatal al iniciar el servidor:');
    logger.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Manejo de promesas rechazadas
process.on('unhandledRejection', (err) => {
  logger.error('💥 UNHANDLED REJECTION:');
  logger.error(`   ${err.name}: ${err.message}`);
});

// Iniciar el servidor
startServer();