require('dotenv').config();

class EnvironmentManager {
  static instance = null;
  
  constructor() {
    this.validateEnvironment();
  }
  
  static getInstance() {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }
  
  validateEnvironment() {
    const required = ['MONGODB_URL', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing: ${missing.join(', ')}`);
      process.exit(1);
    }
  }
  
  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }
}

module.exports = EnvironmentManager.getInstance();
