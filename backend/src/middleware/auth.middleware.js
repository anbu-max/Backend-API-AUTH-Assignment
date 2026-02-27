const AuthService = require('../services/authService');
const { AuthenticationError, AuthorizationError } = require('../exceptions/ApplicationError');

class AuthMiddleware {
  static verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
      }
      
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      
      req.user = decoded;
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  }
  
  static requireRole(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AuthenticationError('Not authenticated'));
      }
      
      if (!roles.includes(req.user.role)) {
        return next(new AuthorizationError('Insufficient permissions'));
      }
      
      next();
    };
  }
}

module.exports = AuthMiddleware;
