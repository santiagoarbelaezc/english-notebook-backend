const fs = require('fs');
const path = require('path');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const logger = require('./logger');

/**
 * Subir imagen a Cloudinary y eliminar archivo temporal
 * @param {string} filePath - Ruta del archivo temporal
 * @param {object} options - Opciones adicionales de Cloudinary
 * @returns {Promise<object>} Resultado de la carga
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    // Subir a Cloudinary
    const result = await uploadImage(filePath, {
      folder: 'english-notebook/profiles',
      resource_type: 'auto',
      ...options
    });

    // Eliminar archivo temporal
    try {
      fs.unlinkSync(filePath);
      logger.info(`✅ Archivo temporal eliminado: ${path.basename(filePath)}`);
    } catch (error) {
      logger.warn(`⚠️  Error eliminando archivo temporal: ${error.message}`);
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    // Intentar eliminar archivo temporal en caso de error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      logger.warn(`⚠️  Error limpiando archivo temporal: ${err.message}`);
    }

    logger.error(`❌ Error subiendo imagen a Cloudinary: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen en Cloudinary
 * @returns {Promise<object>} Resultado de la eliminación
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return { success: false, error: 'publicId es requerido' };
    }

    const result = await deleteImage(publicId);

    if (result.success) {
      logger.info(`✅ Imagen eliminada de Cloudinary: ${publicId}`);
    } else {
      logger.warn(`⚠️  Error eliminando imagen: ${result.message}`);
    }

    return result;
  } catch (error) {
    logger.error(`❌ Error en deleteFromCloudinary: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Extraer publicId de URL de Cloudinary
 * @param {string} url - URL completa de Cloudinary
 * @returns {string} Public ID
 */
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Formato: https://res.cloudinary.com/[cloud_name]/image/upload/[public_id]
    const match = url.match(/\/upload\/(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch (error) {
    logger.warn(`⚠️  Error extrayendo publicId: ${error.message}`);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl
};
