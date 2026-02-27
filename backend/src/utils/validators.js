const { ValidationError } = require('../exceptions/ApplicationError');

class TaskValidator {
  static validateCreate(data) {
    const errors = {};
    
    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (data.title.length > 255) {
      errors.title = 'Title must be less than 255 characters';
    }
    
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.priority = 'Priority must be low, medium, or high';
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
    
    return true;
  }
}

class AuthValidator {
  static validatePassword(password) {
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain number');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      throw new ValidationError('Password must contain special character');
    }
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }
}

module.exports = { TaskValidator, AuthValidator };
