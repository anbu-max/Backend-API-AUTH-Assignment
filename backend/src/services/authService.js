const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/environment');
const logger = require('../utils/logger');
const { AuthenticationError, DuplicateError } = require('../exceptions/ApplicationError');
const { AuthValidator } = require('../utils/validators');
const User = require('../models/User');

class AuthService {
  static BCRYPT_ROUNDS = 12;
  
  static async register(userData) {
    const { email, username, password, firstName = '', lastName = '' } = userData;
    
    AuthValidator.validateEmail(email);
    AuthValidator.validatePassword(password);
    
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });
    
    if (existingUser) {
      throw new DuplicateError('User');
    }
    
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
    
    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'user'
    });

    await user.save();
    
    logger.info(`User registered: ${user._id}`);
    
    const tokens = this.generateTokens(user);
    
    return { user: this.sanitizeUser(user), ...tokens };
  }
  
  static async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase(), is_active: true });
    
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    user.last_login = Date.now();
    await user.save();
    
    logger.info(`User logged in: ${user._id}`);
    
    const tokens = this.generateTokens(user);
    
    return { user: this.sanitizeUser(user), ...tokens };
  }
  
  static generateTokens(user) {
    const accessToken = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        role: user.role
      },
      env.get('JWT_SECRET'),
      { expiresIn: env.get('JWT_EXPIRY', '7d') }
    );
    
    const refreshToken = jwt.sign(
      { sub: user._id },
      env.get('JWT_SECRET'),
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  static verifyToken(token) {
    try {
      return jwt.verify(token, env.get('JWT_SECRET'));
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
  
  static sanitizeUser(user) {
    // The `.toObject()` gives us a plain JS object, so we can delete fields safely.
    const sanitized = user.toObject();
    delete sanitized.password_hash;
    return sanitized;
  }
}

module.exports = AuthService;
