# ⚖️ Project Constitution: Gemini.md

## 🏗️ Architectural Invariants
- **A.N.T. Compliance**: Logic must be split across Architecture (SOPs), Navigation (Reasoning/Middleware), and Tools (Atomic Implementation).
- **Self-Healing**: Every tool must report errors using standardized `ApplicationError` classes, and the error handler must attempt recovery or provide detailed diagnostics.
- **Validation-First**: No data enters the "Tools" layer without passing through a "Validation Loop" in the Navigation layer.
- **Statelessness**: The API must remain stateless, using JWT for authentication.

## 📊 Data Schemas (Initial)

### User Schema (MongoDB/Mongoose)
```json
{
  "email": "String (unique, required)",
  "username": "String (unique, required)",
  "password_hash": "String (required)",
  "first_name": "String",
  "last_name": "String",
  "role": "Enum ['user', 'admin'] (default: 'user')",
  "is_active": "Boolean (default: true)",
  "last_login": "Date",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Task Schema (MongoDB/Mongoose)
```json
{
  "user_id": "ObjectId (Ref: User, required)",
  "title": "String (required, max 255)",
  "description": "String (max 5000)",
  "status": "Enum ['pending', 'in_progress', 'completed', 'archived'] (default: 'pending')",
  "priority": "Enum ['low', 'medium', 'high'] (default: 'medium')",
  "due_date": "Date",
  "completed_at": "Date",
  "created_at": "Date",
  "updated_at": "Date"
}
```

## 📜 Behavioral Rules
1. **Tone**: Helpful, deterministic, and professional.
2. **Logic Constraints**: No hardcoded secrets. Use `.env`. Use `.tmp/` for temporary files.
3. **"Do Not" Rules**:
   - Do not use Docker.
   - Do not use PostgreSQL.
   - Do not use `console.log` for production errors (use `logger.js`).
   - Do not guess business logic; ask for clarification.

## 🛠️ Maintenance Log
- [2026-02-26] System initialized with B.L.A.S.T. / A.N.T. protocols.
