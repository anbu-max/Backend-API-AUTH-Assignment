const mongoose = require('mongoose');
const env = require('./environment');
const logger = require('../utils/logger');

class DatabaseManager {
  static instance = null;

  constructor() {
    this.connectionString = env.get('MONGODB_URL');
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect() {
    try {
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected gracefully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      await mongoose.connect(this.connectionString);

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const state = mongoose.connection.readyState;
      const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };
      const status = statusMap[state] || 'unknown';

      if (status === 'connected') {
        return { status: 'healthy', dbStatus: status };
      } else {
         return { status: 'unhealthy', dbStatus: status };
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = DatabaseManager.getInstance();
