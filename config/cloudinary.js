const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verificar configuración básica
const verifyConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`⚠️  Cloudinary: Faltan variables de entorno: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

// Verificar conexión a Cloudinary
const verifyConnection = async () => {
  try {
    if (!verifyConfig()) {
      logger.warn('⚠️  Cloudinary: No está configurado (faltan variables de entorno)');
      return {
        success: false,
        connected: false,
        message: 'Credenciales incompletas',
        cloud_name: null
      };
    }

    // Intentar obtener información de la API
    const result = await cloudinary.api.ping();
    
    logger.info('✅ Cloudinary conectado correctamente');
    logger.info(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    logger.info(`   API Status: ${result.status || 'OK'}`);
    
    return {
      success: true,
      connected: true,
      message: 'Conexión exitosa',
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      status: result.status || 'OK'
    };
  } catch (error) {
    logger.error(`❌ Error conectando a Cloudinary: ${error.message}`);
    logger.error(`   Verifica tus credenciales en .env`);
    
    return {
      success: false,
      connected: false,
      message: `Error: ${error.message}`,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      error: error.message
    };
  }
};

// Subir imagen a Cloudinary
const uploadImage = async (filePath, options = {}) => {
  try {
    if (!verifyConfig()) {
      throw new Error('Cloudinary no está configurado');
    }

    const uploadOptions = {
      folder: 'english-notebook',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: 'auto',
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    logger.info(`✅ Imagen subida: ${result.public_id}`);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    logger.error(`❌ Error subiendo imagen a Cloudinary: ${error.message}`);
    throw error;
  }
};

// Eliminar imagen de Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!verifyConfig()) {
      return { success: false, message: 'Cloudinary no configurado' };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    logger.info(`✅ Imagen eliminada: ${publicId}`);
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    logger.error(`❌ Error eliminando imagen de Cloudinary: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  verifyConfig,
  verifyConnection
};