# 🚀 Backend Assignment - Quick Reference & Code Snippets

## Quick Start (5 mins)

```bash
# 1. Create project
mkdir backend && cd backend

# 2. Initialize
npm init -y
npm install express dotenv cors uuid jsonwebtoken bcryptjs pg axios
npm install -D nodemon jest supertest

# 3. Create directory structure
mkdir -p src/{config,middleware,routes/v1,controllers,services,utils,exceptions,migrations}

# 4. Copy .env.example to .env
cp .env.example .env

# 5. Start developing
npm run dev
```

---

## 📝 Critical Files to Create

### 1️⃣ `.env` (Database & JWT Config)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/assignment_db
DATABASE_POOL_SIZE=10
JWT_SECRET=your_32_char_secret_key_!@#$%^&*()
JWT_EXPIRY=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

### 2️⃣ `package.json` (Scripts)
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "psql assignment_db < src/migrations/001_create_schema.sql"
  }
}
```

### 3️⃣ `src/config/environment.js` (Env Validation)
```javascript
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
      console.error(`❌ Missing: ${missing.join(', ')}`);
      process.exit(1);
    }
  }
  
  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }
}

module.exports = EnvironmentManager.getInstance();
```

### 4️⃣ `src/config/database.js` (Connection Pool)
```javascript
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
  }
  
  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  
  async query(sql, values = []) {
    try {
      return await this.pool.query(sql, values);
    } catch (error) {
      logger.error('Database error:', error.message);
      throw error;
    }
  }
  
  async healthCheck() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = DatabaseManager.getInstance();
```

### 5️⃣ `src/utils/logger.js` (Logging)
```javascript
class Logger {
  info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }
  
  warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
  
  error(message, data = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
  }
}

module.exports = new Logger();
```

### 6️⃣ `src/exceptions/ApplicationError.js` (Error Classes)
```javascript
class ApplicationError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
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
```

### 7️⃣ `src/services/authService.js` (Auth Logic)
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/environment');
const database = require('../config/database');
const logger = require('../utils/logger');
const { ValidationError, AuthenticationError, DuplicateError } = require('../exceptions/ApplicationError');

class AuthService {
  static async register(userData) {
    const { email, username, password, firstName = '', lastName = '' } = userData;
    
    // Validate
    this.validatePassword(password);
    this.validateEmail(email);
    
    // Check duplicate
    const existing = await database.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );
    
    if (existing.rows.length > 0) {
      throw new DuplicateError('User');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await database.query(
      `INSERT INTO users (id, email, username, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'user')
       RETURNING id, email, username, role, created_at`,
      [uuidv4(), email.toLowerCase(), username.toLowerCase(), passwordHash, firstName, lastName]
    );
    
    const user = result.rows[0];
    const tokens = this.generateTokens(user);
    
    logger.info(`User registered: ${user.id}`);
    
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
    
    // Update last login
    await database.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    logger.info(`User logged in: ${user.id}`);
    
    return { user: this.sanitizeUser(user), ...tokens };
  }
  
  static generateTokens(user) {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
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
  
  static sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = AuthService;
```

### 8️⃣ `src/middleware/auth.middleware.js` (Auth Guard)
```javascript
const AuthService = require('../services/authService');
const { AuthenticationError, AuthorizationError } = require('../exceptions/ApplicationError');

class AuthMiddleware {
  static verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authorization header');
      }
      
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      
      req.user = decoded;
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
```

### 9️⃣ `src/controllers/taskController.js` (CRUD Logic)
```javascript
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, AuthorizationError } = require('../exceptions/ApplicationError');

class TaskController {
  static async createTask(req, res, next) {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user.sub;
      
      // Validation loop
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
      
      // Insert
      const result = await database.query(
        `INSERT INTO tasks (id, user_id, title, description, priority, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [uuidv4(), userId, title.trim(), description?.trim() || null, priority || 'medium']
      );
      
      logger.info(`Task created: ${result.rows[0].id}`);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Task created'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTasks(req, res, next) {
    try {
      const userId = req.user.sub;
      const { status, priority, page = 1, limit = 10 } = req.query;
      
      // Validation
      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params = [userId];
      let paramCount = 2;
      
      if (status && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }
      
      // Pagination
      const pageNum = Math.max(1, parseInt(page));
      const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * pageSize;
      
      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(pageSize, offset);
      
      // Get data
      const result = await database.query(query, params);
      const countResult = await database.query(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
        [userId]
      );
      
      res.json({
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
      const { title, status } = req.body;
      const userId = req.user.sub;
      
      // Authorization
      const taskResult = await database.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        throw new NotFoundError('Task');
      }
      
      if (taskResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot update other tasks');
      }
      
      // Update
      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (status !== undefined && ['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
        updates.status = status;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.json({ success: true, data: taskResult.rows[0] });
      }
      
      const setClauses = Object.keys(updates)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');
      
      const updateResult = await database.query(
        `UPDATE tasks SET ${setClauses} WHERE id = $1 RETURNING *`,
        [taskId, ...Object.values(updates)]
      );
      
      res.json({ success: true, data: updateResult.rows[0] });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const userId = req.user.sub;
      
      // Check ownership
      const taskResult = await database.query(
        'SELECT user_id FROM tasks WHERE id = $1',
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        throw new NotFoundError('Task');
      }
      
      if (taskResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot delete other tasks');
      }
      
      await database.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      
      res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
```

### 🔟 `src/routes/v1/auth.routes.js` (Auth Routes)
```javascript
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
```

### 1️⃣1️⃣ `src/routes/v1/tasks.routes.js` (Task Routes)
```javascript
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
```

### 1️⃣2️⃣ `src/routes/health.routes.js` (Health Check)
```javascript
const express = require('express');
const database = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const health = await database.healthCheck();
    res.json({
      status: 'ok',
      database: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

module.exports = router;
```

### 1️⃣3️⃣ `src/app.js` (Main App)
```javascript
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
    
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        logger.info(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`);
      });
      next();
    });
  }
  
  setupRoutes() {
    this.app.use('/api/v1/health', healthRoutes);
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/tasks', taskRoutes);
    
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: { message: 'Route not found' } });
    });
  }
  
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      if (err instanceof ApplicationError) {
        return res.status(err.statusCode).json(err.toJSON());
      }
      
      if (err.code === '23505') {
        return res.status(409).json({ error: { message: 'Duplicate entry' } });
      }
      
      logger.error('Unhandled error:', err);
      res.status(500).json({ error: { message: 'Internal server error' } });
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
      logger.error('❌ Failed to start:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new Application().start();
}

module.exports = new Application().app;
```

### 1️⃣4️⃣ `src/migrations/001_create_schema.sql` (Database Schema)
```sql
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
  last_login TIMESTAMP,
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

CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tasks_update_timestamp BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

## 🧪 Testing Examples

### Test: Password Validation
```javascript
const AuthService = require('../src/services/authService');

describe('AuthService', () => {
  test('rejects password < 8 chars', () => {
    expect(() => AuthService.validatePassword('Abc1!')).toThrow();
  });
  
  test('rejects password without uppercase', () => {
    expect(() => AuthService.validatePassword('validpass123!')).toThrow();
  });
  
  test('accepts valid password', () => {
    expect(() => AuthService.validatePassword('ValidPass123!')).not.toThrow();
  });
});
```

### Test: API Endpoint
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('POST /api/v1/auth/login', () => {
  test('returns 200 with valid credentials', async () => {
    // Setup: Create user first
    await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'ValidPass123!',
      firstName: 'Test'
    });
    
    // Test login
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'ValidPass123!'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });
  
  test('returns 401 with invalid password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPassword123!'
    });
    
    expect(response.status).toBe(401);
  });
});
```

---

## 🔧 Debugging Checklist

**Port Already in Use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database Connection Issues:**
```bash
psql -U postgres -c "SELECT 1"
psql assignment_db -U postgres -c "\dt"
```

**JWT Token Decode:**
```javascript
const jwt = require('jsonwebtoken');
const token = 'your_token_here';
console.log(jwt.decode(token));
```

**Test Single Endpoint:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123!"}'
```

---

## 💡 Pro Tips for Interview

1. **Know Your Validation Strategy**
   - Collect ALL errors, don't fail on first
   - Return detailed field-level errors
   - Explain why you validate server-side

2. **Explain Error Handling**
   - How you classify errors
   - Recovery strategies used
   - Why centralized error handling matters

3. **Security Features**
   - Bcrypt hashing (12 rounds)
   - JWT tokens (access + refresh)
   - SQL injection prevention
   - Authorization checks

4. **Scalability Readiness**
   - Connection pooling
   - Database indexes
   - Pagination
   - Stateless design (horizontal scaling)

5. **Edge Cases Handled**
   - Duplicate email/username
   - Expired tokens
   - Missing authorization header
   - Invalid UUIDs
   - SQL constraint violations

---

## 📊 API Response Examples

**Register Success (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Error (400):**
```json
{
  "error": {
    "name": "ValidationError",
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00Z",
    "details": {
      "password": "Must contain uppercase letter",
      "email": "Invalid format"
    }
  }
}
```

**Unauthorized (401):**
```json
{
  "error": {
    "name": "AuthenticationError",
    "message": "Invalid email or password",
    "code": "AUTHENTICATION_ERROR",
    "statusCode": 401,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Not Found (404):**
```json
{
  "error": {
    "name": "NotFoundError",
    "message": "Task not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

Good luck! You've got this! 🚀
