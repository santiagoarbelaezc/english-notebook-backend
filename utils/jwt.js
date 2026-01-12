const jwt = require('jsonwebtoken');
const logger = require('./logger');

class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRE || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRE || '30d';
  }

  // Generar token de acceso
  generateAccessToken(payload) {
    if (!this.secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    return jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      this.secret,
      {
        expiresIn: this.expiresIn,
        issuer: 'english-notebook-api',
        audience: 'english-notebook-client'
      }
    );
  }

  // Generar token de refresco
  generateRefreshToken(payload) {
    if (!this.secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    return jwt.sign(
      {
        ...payload,
        type: 'refresh'
      },
      this.secret,
      {
        expiresIn: this.refreshExpiresIn,
        issuer: 'english-notebook-api',
        audience: 'english-notebook-client'
      }
    );
  }

  // Verificar token
  verifyToken(token, type = 'access') {
    try {
      if (!this.secret) {
        throw new Error('JWT_SECRET no configurado');
      }

      const decoded = jwt.verify(token, this.secret, {
        issuer: 'english-notebook-api',
        audience: 'english-notebook-client'
      });

      // Verificar tipo de token
      if (decoded.type !== type) {
        throw new Error(`Token tipo ${decoded.type} no válido para ${type}`);
      }

      return {
        valid: true,
        expired: false,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        expired: error.message.includes('jwt expired'),
        decoded: null,
        error: error.message
      };
    }
  }

  // Decodificar token sin verificar (solo para lectura)
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Generar ambos tokens (acceso y refresco)
  generateTokens(user) {
    const payload = {
      userId: user._id || user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'student'
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      accessTokenExpires: this.getTokenExpiration(accessToken),
      refreshTokenExpires: this.getTokenExpiration(refreshToken)
    };
  }

  // Obtener fecha de expiración del token
  getTokenExpiration(token) {
    const decoded = this.decodeToken(token);
    return decoded ? new Date(decoded.exp * 1000) : null;
  }

  // Refrescar token
  refreshToken(refreshToken) {
    const verification = this.verifyToken(refreshToken, 'refresh');
    
    if (!verification.valid) {
      throw new Error('Refresh token inválido');
    }

    if (verification.expired) {
      throw new Error('Refresh token expirado');
    }

    // Generar nuevos tokens
    return this.generateTokens(verification.decoded);
  }
}

module.exports = new JWTService();