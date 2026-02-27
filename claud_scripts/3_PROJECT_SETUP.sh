#!/bin/bash
# Backend Assignment - Complete Project Generator
# This script creates the entire project structure with all necessary files

set -e

echo "🚀 Initializing Backend Assignment Project..."

# 1. Create directory structure
mkdir -p backend/{src/{config,middleware,routes/v1,controllers,models,services,utils,exceptions,migrations},tests/{unit,integration},docs}
cd backend

# 2. Initialize npm project
npm init -y

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install express dotenv cors uuid jsonwebtoken bcryptjs pg axios
npm install -D nodemon jest supertest

# 4. Create .env.example
cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/assignment_db
DATABASE_POOL_SIZE=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long_!@#$%^&*
JWT_EXPIRY=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
EOF

# 5. Update package.json scripts
cat > package.json << 'EOF'
{
  "name": "backend-assignment",
  "version": "1.0.0",
  "description": "Scalable REST API with JWT Authentication",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "node src/migrations/run.js",
    "seed": "node src/migrations/seed.js"
  },
  "keywords": ["API", "REST", "JWT", "Authentication"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.2",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
EOF

# 6. Create configuration files

# Environment manager
cat > src/config/environment.js << 'EOF'
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
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
      console.error('Please copy .env.example to .env and fill in required values.');
      process.exit(1);
    }
  }
  
  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }
}

module.exports = EnvironmentManager.getInstance();
EOF

# Logger utility
cat > src/utils/logger.js << 'EOF'
const env = require('../config/environment');

class Logger {
  constructor() {
    this.logLevel = env.get('LOG_LEVEL', 'info');
  }
  
  info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }
  
  warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
  
  error(message, data = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
  }
  
  debug(message, data = {}) {
    if (this.logLevel === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
}

module.exports = new Logger();
EOF

# Database connection
cat > src/config/database.js << 'EOF'
const { Pool } = require('pg');
const env = require('./environment');
const logger = require('../utils/logger');

class DatabaseManager {
  static instance = null;
  
  constructor() {
    this.pool = new Pool({
      connectionString: env.get('DATABASE_URL'),
      max: parseInt(env.get('DATABASE_POOL_SIZE', 10))
    });
    
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }
  
  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  
  async query(sql, values = []) {
    const startTime = Date.now();
    try {
      const result = await this.pool.query(sql, values);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logger.warn(`Slow query (${duration}ms): ${sql}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Database query error', { sql, error: error.message });
      throw error;
    }
  }
  
  async healthCheck() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return { status: 'healthy', timestamp: result.rows[0].now };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = DatabaseManager.getInstance();
EOF

# Exception classes
cat > src/exceptions/ApplicationError.js << 'EOF'
class ApplicationError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details
    };
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class DuplicateError extends ApplicationError {
  constructor(resource = 'Resource') {
    super(`${resource} already exists`, 409, 'DUPLICATE_ERROR');
  }
}

module.exports = {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError
};
EOF

# Validators
cat > src/utils/validators.js << 'EOF'
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
EOF

# Auth Service
cat > src/services/authService.js << 'EOF'
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/environment');
const database = require('../config/database');
const logger = require('../utils/logger');
const { ValidationError, AuthenticationError, DuplicateError } = require('../exceptions/ApplicationError');
const { AuthValidator } = require('../utils/validators');

class AuthService {
  static BCRYPT_ROUNDS = 12;
  
  static async register(userData) {
    const { email, username, password, firstName = '', lastName = '' } = userData;
    
    AuthValidator.validateEmail(email);
    AuthValidator.validatePassword(password);
    
    const existingUser = await database.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      throw new DuplicateError('User');
    }
    
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
    
    const result = await database.query(
      `INSERT INTO users (id, email, username, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'user')
       RETURNING id, email, username, role, created_at`,
      [uuidv4(), email.toLowerCase(), username.toLowerCase(), passwordHash, firstName, lastName]
    );
    
    const user = result.rows[0];
    logger.info(`User registered: ${user.id}`);
    
    const tokens = this.generateTokens(user);
    
    return { user, ...tokens };
  }
  
  static async login(email, password) {
    const result = await database.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    await database.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    logger.info(`User logged in: ${user.id}`);
    
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
    
    return { user: this.sanitizeUser(user), ...tokens };
  }
  
  static generateTokens(user) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      env.get('JWT_SECRET'),
      { expiresIn: env.get('JWT_EXPIRY', '7d') }
    );
    
    const refreshToken = jwt.sign(
      { sub: user.id },
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
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = AuthService;
EOF

# Auth Middleware
cat > src/middleware/auth.middleware.js << 'EOF'
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
EOF

# Task Controller
cat > src/controllers/taskController.js << 'EOF'
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, AuthorizationError } = require('../exceptions/ApplicationError');

class TaskController {
  static async createTask(req, res, next) {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user.sub;
      
      const errors = {};
      
      if (!title || title.trim().length === 0) {
        errors.title = 'Title is required';
      } else if (title.length > 255) {
        errors.title = 'Title too long';
      }
      
      if (priority && !['low', 'medium', 'high'].includes(priority)) {
        errors.priority = 'Invalid priority';
      }
      
      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
      }
      
      const result = await database.query(
        `INSERT INTO tasks (id, user_id, title, description, priority, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [uuidv4(), userId, title.trim(), description?.trim() || null, priority || 'medium']
      );
      
      logger.info(`Task created: ${result.rows[0].id}`);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTasks(req, res, next) {
    try {
      const userId = req.user.sub;
      const { status, priority, page = 1, limit = 10 } = req.query;
      
      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params = [userId];
      let paramCount = 2;
      
      if (status && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }
      
      if (priority && ['low', 'medium', 'high'].includes(priority)) {
        query += ` AND priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
      }
      
      const pageNum = Math.max(1, parseInt(page));
      const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * pageSize;
      
      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(pageSize, offset);
      
      const result = await database.query(query, params);
      const countResult = await database.query(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
        [userId]
      );
      
      return res.json({
        success: true,
        data: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: pageNum,
          limit: pageSize
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const { title, description, status, priority } = req.body;
      const userId = req.user.sub;
      
      const taskResult = await database.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        throw new NotFoundError('Task');
      }
      
      const task = taskResult.rows[0];
      if (task.user_id !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot update other users\' tasks');
      }
      
      const updates = {};
      if (title !== undefined) {
        updates.title = title.trim();
      }
      
      if (description !== undefined) {
        updates.description = description?.trim() || null;
      }
      
      if (status !== undefined && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        updates.status = status;
      }
      
      if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
        updates.priority = priority;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.json({ success: true, data: task });
      }
      
      const setClauses = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const updateResult = await database.query(
        `UPDATE tasks SET ${setClauses} WHERE id = $1 RETURNING *`,
        [taskId, ...Object.values(updates)]
      );
      
      logger.info(`Task updated: ${taskId}`);
      
      return res.json({
        success: true,
        data: updateResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const userId = req.user.sub;
      
      const taskResult = await database.query(
        'SELECT user_id FROM tasks WHERE id = $1',
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        throw new NotFoundError('Task');
      }
      
      if (taskResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot delete other users\' tasks');
      }
      
      await database.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      
      logger.info(`Task deleted: ${taskId}`);
      
      return res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
EOF

# Auth Routes
cat > src/routes/v1/auth.routes.js << 'EOF'
const express = require('express');
const AuthService = require('../../services/authService');
const { ValidationError } = require('../../exceptions/ApplicationError');
const AuthMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }
    const result = await AuthService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/verify', AuthMiddleware.verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
EOF

# Task Routes
cat > src/routes/v1/tasks.routes.js << 'EOF'
const express = require('express');
const TaskController = require('../../controllers/taskController');
const AuthMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(AuthMiddleware.verifyToken);

router.post('/', TaskController.createTask);
router.get('/', TaskController.getTasks);
router.put('/:taskId', TaskController.updateTask);
router.delete('/:taskId', TaskController.deleteTask);

module.exports = router;
EOF

# Health Routes
cat > src/routes/health.routes.js << 'EOF'
const express = require('express');
const database = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    res.json({
      status: 'ok',
      database: dbHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
EOF

# Main App
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const env = require('./config/environment');
const database = require('./config/database');
const logger = require('./utils/logger');
const { ApplicationError } = require('./exceptions/ApplicationError');

const authRoutes = require('./routes/v1/auth.routes');
const taskRoutes = require('./routes/v1/tasks.routes');
const healthRoutes = require('./routes/health.routes');

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
    
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: { message: 'Route not found', path: req.originalUrl }
      });
    });
  }
  
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      if (err instanceof ApplicationError) {
        return res.status(err.statusCode).json(err.toJSON());
      }
      
      // Handle PostgreSQL errors
      if (err.code === '23505') {
        return res.status(409).json({
          error: { message: 'Duplicate entry', code: 'DUPLICATE' }
        });
      }
      
      logger.error('Unexpected error', { error: err.message });
      res.status(500).json({
        error: { message: 'Internal server error' }
      });
    });
  }
  
  async start() {
    try {
      const health = await database.healthCheck();
      if (health.status !== 'healthy') {
        throw new Error('Database connection failed');
      }
      
      const port = env.get('PORT', 3000);
      this.app.listen(port, () => {
        logger.info(`✅ Server running on http://localhost:${port}`);
      });
    } catch (error) {
      logger.error('❌ Failed to start server', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const app = new Application();
  app.start();
}

module.exports = new Application().app;
EOF

# Database migrations
cat > src/migrations/001_create_schema.sql << 'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tasks_update_timestamp BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EOF

# package.json (final version)
cat > package.json << 'EOF'
{
  "name": "backend-assignment",
  "version": "1.0.0",
  "description": "Scalable REST API with JWT Authentication",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "node src/migrations/run.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.2",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
*.log
.idea/
dist/
build/
coverage/
EOF

# Create README
cat > README.md << 'EOF'
# Backend Assignment - Scalable REST API with JWT Authentication

Production-ready REST API with user authentication, role-based access control, and CRUD operations.

## Features

- ✅ User registration & login with JWT tokens
- ✅ Role-based access control (user/admin)
- ✅ CRUD APIs for tasks
- ✅ Input validation with detailed error messages
- ✅ PostgreSQL database with migrations
- ✅ Comprehensive error handling
- ✅ Production logging

## Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE assignment_db;
   ```

4. **Run migrations**
   ```bash
   psql assignment_db < src/migrations/001_create_schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/verify` - Verify token

### Tasks (requires authentication)
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:taskId` - Update task
- `DELETE /api/v1/tasks/:taskId` - Delete task

### Health
- `GET /api/v1/health` - Health check

## Testing

```bash
npm test
npm run test:watch
```

## Architecture

- **Modular Structure** - Controllers, services, models separation
- **Error Handling** - Centralized exception handling
- **Security** - Password hashing, JWT tokens, input validation
- **Scalability** - Connection pooling, database indexes, pagination
- **Logging** - Detailed request/error logging

## Docker

```bash
docker-compose up --build
```

## Environment Variables

See `.env.example` for required configuration.

---

Built for the Backend Developer Intern Assignment
EOF

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Create PostgreSQL database: CREATE DATABASE assignment_db;"
echo "3. Run migrations: psql assignment_db < src/migrations/001_create_schema.sql"
echo "4. Start server: npm run dev"
echo ""
echo "🚀 Happy coding!"
EOF

chmod +x setup.sh

echo "✅ All files created successfully!"
