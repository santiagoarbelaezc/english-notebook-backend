const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verificar configuración
const verifyConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`⚠️  Cloudinary: Faltan variables de entorno: ${missing.join(', ')}`);
    logger.warn('💡 Las imágenes se guardarán localmente');
    return false;
  }
  
  logger.info('✅ Cloudinary configurado correctamente');
  return true;
};

// Subir imagen a Cloudinary
const uploadImage = async (filePath, options = {}) => {
  try {
    if (!verifyConfig()) {
      throw new Error('Cloudinary no configurado');
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
  verifyConfig
};