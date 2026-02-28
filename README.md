# 🎓 Harvard School of Business: Student Management System

A premium, production-ready student management application built with Node.js, Express, MongoDB, and React. This project demonstrates enterprise-level patterns, including role-based access control (Teachers vs Students), centralized authentication, and a dynamic, responsive UI.

## ✨ Key Features

- **Full-Stack Integration**: Seamless communication between React frontend and Node.js backend.
- **Self-Healing Error System**: Centralized error middleware that categorizes and formats all application errors.
- **Premium UI/UX**: High-performance React interface with glassmorphism, Framer Motion animations, and real-time toast notifications.
- **Secure Authentication**: JWT-based auth with Role-Based Access Control (RBAC) ensuring only Teachers can manage records.
- **Advanced Directory Management**: CRUD operations for student records with academic performance tracking, enrollment statuses, and live search.
- **Unified Workspace**: Single-command startup for both frontend and backend.

## 🏗️ Technology Stack

- **Frontend**: React (Vite), Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB.
- **Security**: JWT (JsonWebToken), BcryptJS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Setup Environment
**Backend**: Create `backend/.env`
```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_32_char_secret_key_!@#$%^&*()
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 2. Install & Start
From the project root:
```bash
# Install all dependencies
npm run install-all

# Start both servers (Frontend + Backend)
npm start
```
The app will be live at [http://localhost:5173](http://localhost:5173).

## 📡 API Architecture

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get token |
| GET | `/api/v1/students` | Get student directory (with filters) |
| POST | `/api/v1/students` | Add new student to directory |
| PUT | `/api/v1/students/:id` | Update student status/performance |
| DELETE | `/api/v1/students/:id` | Remove student record |

## 🧪 Interview Highlights

During implementation, focus was placed on:
1. **Clean Code**: Layered architecture (Controllers, Services, Models).
2. **Resilience**: Centralized `ApplicationError` class for consistent API responses.
3. **UX**: Minimizing layout shift and providing immediate feedback for all CRUD operations.
