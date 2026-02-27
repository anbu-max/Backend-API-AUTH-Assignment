const express = require('express');
const cors = require('cors');
const env = require('./config/environment');
const database = require('./config/database');
const logger = require('./utils/logger');
const { ApplicationError } = require('./exceptions/ApplicationError');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/v1/auth.routes');
const taskRoutes = require('./routes/v1/tasks.routes');

class Application {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  setupMiddleware() {
    this.app.use(cors({
      origin: env.get('FRONTEND_URL', 'http://localhost:5173'),
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ limit: '10kb', extended: true }));
    
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }
  
  setupRoutes() {
    this.app.use('/api/v1/health', healthRoutes);
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/tasks', taskRoutes);
    
    this.app.use((req, res) => {
      res.status(404).json({ error: { message: 'Route not found' } });
    });
  }
  
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      if (err instanceof ApplicationError) {
        return res.status(err.statusCode).json(err.toJSON());
      }
      
      logger.error('Unhandled error:', err);
      res.status(500).json({ error: { message: 'Internal server error' } });
    });
  }
  
  async start() {
    try {
      await database.connect();
      
      const port = env.get('PORT', 3000);
      this.app.listen(port, () => {
        logger.info(`✅ Server running on http://localhost:${port}`);
      });
    } catch (error) {
      logger.error('❌ Failed to start:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new Application().start();
}

module.exports = new Application().app;
