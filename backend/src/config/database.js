const mongoose = require('mongoose');
const env = require('./environment');
const logger = require('../utils/logger');

const MONGOOSE_OPTS = {
  // --- TLS / SSL ---
  // `tlsInsecure: true` bypasses all TLS validation — required on Windows when
  // Node's bundled OpenSSL conflicts with Atlas's TLS negotiation (SSL alert 80).
  // ⚠️  Remove in production and use proper certificate pinning instead.
  tls: true,
  tlsInsecure: true,

  // --- Timeouts ---
  serverSelectionTimeoutMS: 10000,    // fail fast (default is 30 000)
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,

  // --- Connection pool ---
  maxPoolSize: 10,
  minPoolSize: 1,

  // --- Retry ---
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
};

class DatabaseManager {
  static instance = null;
  static MAX_RETRIES = 5;

  constructor() {
    this.connectionString = env.get('MONGODB_URL');
    this.retries = 0;
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect() {
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully');
      this.retries = 0;
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      this._scheduleReconnect();
    });

    await this._connect();
  }

  async _connect() {
    try {
      logger.info(`🔌 Connecting to MongoDB (attempt ${this.retries + 1})...`);
      await mongoose.connect(this.connectionString, MONGOOSE_OPTS);
    } catch (error) {
      logger.error(`❌ MongoDB connection failed: ${error.message}`);
      this.retries++;

      if (this.retries <= DatabaseManager.MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** this.retries, 30000); // exponential backoff, max 30s
        logger.warn(`⏳ Retrying in ${delay / 1000}s... (${this.retries}/${DatabaseManager.MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        return this._connect();
      }

      logger.error('💀 Max retries reached. Giving up on MongoDB connection.');
      throw error;
    }
  }

  _scheduleReconnect() {
    if (mongoose.connection.readyState === 0) {
      setTimeout(() => {
        logger.info('🔄 Attempting reconnection to MongoDB...');
        this._connect().catch(err => logger.error('Reconnection failed:', err.message));
      }, 5000);
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
      return state === 1
        ? { status: 'healthy', dbStatus: status }
        : { status: 'unhealthy', dbStatus: status };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = DatabaseManager.getInstance();
