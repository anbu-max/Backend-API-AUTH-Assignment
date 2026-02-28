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
    const { email, password, firstName = '', lastName = '' } = userData;
    let username = userData.username;
    
    // Auto-generate a username if not provided
    if (!username || username.trim() === '') {
      const baseString = `${firstName.toLowerCase().replace(/\s/g, '')}${lastName.toLowerCase().replace(/\s/g, '')}`;
      username = baseString.length > 0 ? `${baseString}${Math.floor(Math.random() * 10000)}` : `user${Math.floor(Math.random() * 1000000)}`;
    }

    if (userData.role === 'teacher') {
      const validAdminCode = env.get('ADMIN_REGISTRATION_CODE');
      if (!userData.adminCode || userData.adminCode !== validAdminCode) {
        throw new AuthenticationError('Invalid school password for teacher registration');
      }
    }
    
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
      role: ['student', 'teacher'].includes(userData.role) ? userData.role : 'student'
    });

    await user.save();
    
    logger.info(`User registered: ${user._id}`);
    
    const tokens = this.generateTokens(user);
    
    return { user: this.sanitizeUser(user), ...tokens };
  }
  
  static async login(email, password, role, adminCode) {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      throw new AuthenticationError("User doesn't exist. Please register first.");
    }
    
    if (role && role !== user.role) {
      throw new AuthenticationError("Role mismatch. Please select your correct role.");
    }

    if (user.role === 'teacher') {
      const validAdminCode = env.get('ADMIN_REGISTRATION_CODE');
      if (!adminCode || adminCode !== validAdminCode) {
        throw new AuthenticationError('Invalid school password for teacher login');
      }
    }
    
    if (!user.is_active) {
      throw new AuthenticationError('Account is inactive. Please contact admin.');
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new AuthenticationError('Invalid password. Please try again.');
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
