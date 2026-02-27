📋🎯 START WITH THIS FILE:
1️⃣ NO_DOCKER_SETUP.md ← BEGIN HERE

Read this first (5 minutes)
Understand: No Docker, MongoDB instead of PostgreSQL
Prerequisites check
Quick overview of setup


📑 FILE READING ORDER
Phase 1: Learn Architecture (30 minutes)
1. NO_DOCKER_SETUP.md (MongoDB version)
   ↓
2. FILES_AVAILABLE.txt (understand what files you have)
   ↓
3. 1_ASSIGNMENT_GUIDE_MONGODB.md (read Phase 1-3 only)
Phase 2: Implementation (2-3 hours)
While Coding:
1. 1_ASSIGNMENT_GUIDE_MONGODB.md (follow each phase)
   ↓
2. 4_QUICK_REFERENCE_MONGODB.md (copy code as you need it)
   ↓
3. 2_IMPLEMENTATION_CHECKLIST.md (verify each step)
Phase 3: Testing & Submission (1 hour)
1. 2_IMPLEMENTATION_CHECKLIST.md (final verification)
   ↓
2. 4_QUICK_REFERENCE_MONGODB.md (API testing commands)
   ↓
3. README.md (write your project README)

🏗️ OVERALL ARCHITECTURE - MONGODB
High-Level View
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│              http://localhost:5173                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls (HTTP/JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│              http://localhost:3000/api/v1                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes & Controllers                                   │ │
│  │  POST /auth/register                                   │ │
│  │  POST /auth/login                                      │ │
│  │  GET  /tasks (with JWT token)                          │ │
│  │  POST /tasks (with JWT token)                          │ │
│  │  PUT  /tasks/:id (with JWT token)                      │ │
│  │  DELETE /tasks/:id (with JWT token)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐ │
│  │ Middleware Layer                                       │ │
│  │  - Auth Middleware (JWT verification)                  │ │
│  │  - Error Handler (self-healing system)                 │ │
│  │  - CORS, JSON parser                                   │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐ │
│  │ Services & Business Logic (Mongoose Models)            │ │
│  │  - AuthService (register, login, JWT)                  │ │
│  │  - TaskService (CRUD operations)                       │ │
│  │  - Validation (password, email, etc)                   │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐ │
│  │ Mongoose ODM Layer                                     │ │
│  │  - User Model (schema validation)                      │ │
│  │  - Task Model (schema validation)                      │ │
│  │  - Middleware (pre/post hooks)                         │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         MongoDB Database (localhost:27017)                   │
│                                                              │
│  Database: assignment_db                                    │
│  Collections:                                               │
│  - users (documents with fields)                            │
│  - tasks (documents with fields)                            │
│  - Indexes (for performance)                                │
└──────────────────────────────────────────────────────────────┘
Directory Structure (Same but MongoDB)
backend/
├── src/
│   ├── config/
│   │   ├── environment.js        ← Env validation
│   │   └── database.js           ← MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.js    ← JWT check
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── auth.routes.js    ← /auth endpoints
│   │   │   └── tasks.routes.js   ← /tasks endpoints
│   │   └── health.routes.js      ← Health check
│   ├── controllers/
│   │   └── taskController.js     ← CRUD logic
│   ├── services/
│   │   └── authService.js        ← Auth logic
│   ├── models/
│   │   ├── User.js               ← Mongoose schema
│   │   └── Task.js               ← Mongoose schema
│   ├── utils/
│   │   ├── logger.js             ← Logging
│   │   ├── errorHandler.js       ← Error recovery
│   │   └── validators.js         ← Input validation
│   ├── exceptions/
│   │   └── ApplicationError.js   ← Custom errors
│   └── app.js                    ← Main app
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── README.md

🔄 KEY DIFFERENCES: MongoDB vs PostgreSQL
Database
PostgreSQL                          MongoDB
─────────────────────────────────────────────────
SQL Tables                          JSON-like Collections
Schemas enforced                    Flexible schemas (validate in code)
Complex joins                       Embedded documents
ACID transactions                   ACID transactions (recent versions)
Connection
PostgreSQL: Pool connection          MongoDB: Mongoose connection
pool.query("SELECT...")              await User.find({...})
Models
PostgreSQL: No ORM required          MongoDB: Mongoose schemas
Raw SQL with parameterization       Schema validation & middleware
Installation
PostgreSQL: createdb, psql           MongoDB: mongod service
Password required                    Runs on localhost:27017

📊 MONGOOSE MODELS (Instead of SQL)
User Model
javascript// src/models/User.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: String,
  last_name: String,
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  is_active: { type: Boolean, default: true },
  last_login: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto-update timestamp on save
userSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('User', userSchema);
Task Model
javascript// src/models/Task.js
const taskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String, maxlength: 5000 },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'archived'],
    default: 'pending'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  due_date: Date,
  completed_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Indexes for performance
taskSchema.index({ user_id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ created_at: -1 });

module.exports = mongoose.model('Task', taskSchema);
```

---

## 🎯 **REQUEST FLOW WITH MONGODB**

### **Example: User Login**
```
1. FRONTEND SENDS REQUEST
   POST http://localhost:3000/api/v1/auth/login
   Body: { email: "user@example.com", password: "Pass123!" }

2. EXPRESS ROUTES
   Route handler in auth.routes.js receives request

3. CONTROLLER LAYER
   authController validates email & password format
   
4. SERVICE LAYER
   authService.login() executes:
   - Find user in MongoDB: await User.findOne({ email })
   - Compare password with hash
   - Generate JWT token
   - Return token to frontend

5. MIDDLEWARE
   Error handling catches any issues
   Response sent back to frontend

6. FRONTEND
   Receives token: { accessToken: "xyz...", user: {...} }
   Saves token in localStorage
   Redirects to dashboard

7. NEXT REQUEST (Protected)
   GET http://localhost:3000/api/v1/tasks
   Header: Authorization: Bearer xyz...
   
8. AUTH MIDDLEWARE
   Verifies token is valid
   Extracts user info from token
   Continues to route handler

9. MONGODB QUERY
   Query: await Task.find({ user_id: userId })
   Returns: [{ _id, title, status, ... }, ...]
   
10. RESPONSE
    Frontend receives tasks list
    Renders on dashboard
```

---

## 📊 **DATA FLOW - MONGODB**

### **User Registration**
```
Frontend Form
    ↓
POST /auth/register
    ↓
Validation (email, password strength)
    ↓
Hash Password (bcrypt)
    ↓
Create MongoDB document: new User({ email, password_hash, ... })
    ↓
Save to MongoDB: await user.save()
    ↓
Generate JWT Token
    ↓
Return { user, accessToken, refreshToken }
    ↓
Frontend saves token → Redirects to login
```

### **Create Task (MongoDB)**
```
Frontend (with JWT token)
    ↓
POST /tasks { title, description, priority }
    ↓
Auth Middleware (verify JWT)
    ↓
Validation Loop (collect all errors)
    ↓
Create MongoDB document: new Task({ user_id, title, ... })
    ↓
Save to MongoDB: await task.save()
    ↓
Return created task (201 status)
    ↓
Frontend updates task list
```

---

## 🎯 **EXPECTED OUTPUT - FINAL PHASE**

### **What You Should Have at End**
```
✅ Backend Server Running
   $ npm run dev
   [INFO] ✅ Server started on http://localhost:3000
   [INFO] MongoDB connected: mongodb://localhost:27017/assignment_db

✅ MongoDB Running
   $ mongosh
   > use assignment_db
   > db.users.find()
   []
   > db.tasks.find()
   []

✅ Health Check Working
   $ curl http://localhost:3000/api/v1/health
   {"status":"ok","database":{"status":"healthy"}...}

✅ Registration Working
   $ curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "ValidPass123!",
       "firstName": "Test"
     }'
   Response:
   {
     "success": true,
     "data": {
       "user": { 
         "_id": "507f1f77bcf86cd799439011",
         "email": "test@example.com",
         "username": "testuser",
         "role": "user",
         ...
       },
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc..."
     }
   }

✅ Login Working
   $ curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "ValidPass123!"}'
   Response:
   {
     "success": true,
     "data": {
       "user": {...},
       "accessToken": "...",
       "refreshToken": "..."
     }
   }

✅ Create Task Working (MongoDB)
   $ curl -X POST http://localhost:3000/api/v1/tasks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{"title": "My Task", "priority": "high"}'
   Response:
   {
     "success": true,
     "data": {
       "_id": "507f1f77bcf86cd799439012",
       "user_id": "507f1f77bcf86cd799439011",
       "title": "My Task",
       "priority": "high",
       "status": "pending",
       "created_at": "2024-01-15T10:30:00Z"
     },
     "message": "Task created successfully"
   }

✅ Get Tasks Working
   $ curl http://localhost:3000/api/v1/tasks \
     -H "Authorization: Bearer <TOKEN>"
   Response:
   {
     "success": true,
     "data": [
       { 
         "_id": "507f1f77bcf86cd799439012",
         "title": "My Task", 
         "status": "pending",
         ...
       },
       { 
         "_id": "507f1f77bcf86cd799439013",
         "title": "Task 2", 
         ...
       }
     ],
     "pagination": {
       "total": 2,
       "page": 1,
       "limit": 10,
       "totalPages": 1
     }
   }

✅ MongoDB Contains Data
   $ mongosh assignment_db
   > db.users.countDocuments()
   1
   > db.tasks.countDocuments()
   2
   > db.users.findOne()
   {
     _id: ObjectId("507f1f77bcf86cd799439011"),
     email: 'test@example.com',
     username: 'testuser',
     role: 'user',
     ...
   }

✅ Error Handling Working
   $ curl http://localhost:3000/api/v1/tasks \
     (without token)
   Response: 401
   {
     "error": {
       "name": "AuthenticationError",
       "message": "Missing authorization header",
       "code": "AUTHENTICATION_ERROR",
       "statusCode": 401
     }
   }

✅ Validation Working
   $ curl -X POST http://localhost:3000/api/v1/auth/register \
     -d '{"email": "bad", "password": "weak"}'
   Response: 400
   {
     "error": {
       "message": "Validation failed",
       "code": "VALIDATION_ERROR",
       "details": {
         "email": "Invalid email format",
         "password": "Must be at least 8 characters",
         "username": "Username is required"
       }
     }
   }

✅ SETUP INSTRUCTIONS - MONGODB
1. Install MongoDB
bash# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
Download from: https://www.mongodb.com/try/download/community
Run installer
2. Verify MongoDB Running
bashmongosh
> db.adminCommand('ping')
{ ok: 1 }
3. Create Project
bashmkdir backend && cd backend
npm init -y
npm install express dotenv cors uuid jsonwebtoken bcryptjs mongoose axios
npm install -D nodemon jest supertest
```

### **4. .env File**
```
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/assignment_db
# OR for MongoDB Atlas (cloud):
# MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/assignment_db

# JWT
JWT_SECRET=your_32_char_secret_key_!@#$%^&*
JWT_EXPIRY=7d

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
5. Start Server
bashnpm run dev
6. Test Connection
bashcurl http://localhost:3000/api/v1/health
# Should show MongoDB is connected

✅ FINAL SUBMISSION CHECKLIST - MONGODB
Code Quality

 All files created in correct structure
 Mongoose models created (User.js, Task.js)
 No console.log (use logger)
 All endpoints have error handling
 JWT authentication on protected routes
 Password hashed with bcrypt
 Input validation with error collection

MongoDB

 MongoDB running (mongosh)
 Database "assignment_db" created
 Collections: users, tasks created
 Indexes created for performance
 Mongoose connection working

Testing

 Health endpoint returns 200
 Can register user (checks MongoDB)
 Can login user
 Can create task with token
 Can get tasks (pagination works)
 Can update task
 Can delete task
 Error handling works (401, 400, 404, etc)
 MongoDB contains saved data

Documentation

 README.md written
 .env.example created
 Setup instructions clear
 API endpoints documented

Deployment Ready

 No hardcoded secrets in code
 All env vars in .env.example
 Server starts without errors
 Can run: npm run dev


🚀 SIMPLE SUMMARY - MONGODB
PhaseFilesTimeOutputLearnNO_DOCKER_SETUP.md + 1_ASSIGNMENT_GUIDE_MONGODB.md30 minUnderstand MongoDB architectureBuild1_ASSIGNMENT_GUIDE_MONGODB.md + 4_QUICK_REFERENCE_MONGODB.md2-3 hrsWorking MongoDB backendTest2_IMPLEMENTATION_CHECKLIST.md + curl commands30 minAll endpoints working with MongoDBSubmitREADME.md + GitHub + all code30 minReady to present

🔑 KEY MONGODB CONCEPTS
What is ObjectId?
javascript// MongoDB auto-generates _id (like UUID in PostgreSQL)
user._id  // "507f1f77bcf86cd799439011"
Query Syntax (Different from SQL)
javascript// PostgreSQL: SELECT * FROM users WHERE email = 'x'
// MongoDB:
await User.findOne({ email: 'x' })

// PostgreSQL: SELECT * FROM tasks WHERE user_id = 'x' AND status = 'pending'
// MongoDB:
await Task.find({ user_id: userId, status: 'pending' })

// PostgreSQL: UPDATE users SET name = 'x' WHERE id = 'y'
// MongoDB:
await User.findByIdAndUpdate(userId, { name: 'x' })

// PostgreSQL: DELETE FROM tasks WHERE id = 'x'
// MongoDB:
await Task.findByIdAndDelete(taskId)
Mongoose Pre/Post Hooks (Auto updates)
javascript// Auto update timestamp before save
userSchema.pre('save', function() {
  this.updated_at = Date.now();
});

🎯 THAT'S IT - MONGODB VERSION!
Start → Read → Code → Test → Submit → Ace Interview ✨
Key Difference:

✅ Uses MongoDB (flexible, JSON-like documents)
✅ Uses Mongoose (schema validation, models)
✅ No SQL needed
✅ Same API endpoints
✅ Same error handling
✅ Same security features