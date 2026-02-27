# 📋 Task Plan: Internshala Backend Assignment (MongoDB Version)

## 🏁 Phase 0: Initialization & Discovery
- [x] Initialize Project Memory (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Define Project Constitution (`gemini.md`)
- [x] Discovery Questions Answered
- [x] Data Schema Defined in `gemini.md`

## 🏗️ Phase 1: B - Blueprint (Vision & Logic)
- [x] Setup folder structure (`backend/src/...`)
- [x] Initialize `package.json` and install dependencies (Mongoose, Express, etc)
- [ ] Define Mongoose Models (`src/models/User.js`, `src/models/Task.js`)
- [ ] Configure Environment Variables (`.env.example` and `environment.js`)

## ⚡ Phase 2: L - Link (Connectivity)
- [ ] Implement MongoDB connection (`src/config/database.js`)
- [ ] Build basic infrastructure (`logger.js`, `errorHandler.js`)
- [ ] Build Health Check endpoint (`src/routes/health.routes.js`)
- [ ] Setup Express App (`src/app.js`)

## ⚙️ Phase 3: A - Architect (The 3-Layer Build)
### Layer 1: Architecture (SOPs)
- [ ] Define Authentication Logic SOP
- [ ] Define Task CRUD SOP
- [ ] Define Error Handling & Validation Loop SOP

### Layer 2: Navigation (Decision Making)
- [ ] Implement Custom Exception Classes (`ApplicationError.js`)
- [ ] Implement Input Validation (`validators.js`)
- [ ] Implement Auth Middleware (`auth.middleware.js`)

### Layer 3: Tools (Implementation)
- [ ] Implement AuthService (`authService.js`)
- [ ] Implement TaskController (`taskController.js`)
- [ ] Implement App Routers (`auth.routes.js`, `tasks.routes.js`)

## ✨ Phase 4: S - Stylize (Refinement & UI)
- [ ] Structure JSON API Responses uniquely per guidelines
- [ ] Make a README for the project payload

## 🛰️ Phase 5: T - Trigger (Deployment & Finalization)
- [ ] Write missing unit/integration tests
- [ ] Package final `.zip` payload as instructed
- [ ] Complete Maintenance Log
