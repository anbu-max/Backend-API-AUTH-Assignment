# 🔍 Findings & Discoveries

## 🛠️ Tech Stack & Constraints
- **Core**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Constraint**: No Docker allowed
- **Constraint**: No PostgreSQL (migrated to MongoDB)
- **Architecture**: A.N.T. 3-Layer (Architecture, Navigation, Tools)

## 📌 Research & Dependencies
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `jsonwebtoken`: Auth tokens
- `bcryptjs`: Password hashing
- `dotenv`: Environment configuration
- `cors`: Cross-origin resource sharing
- `uuid`: (Optional, MongoDB handles IDs but might be used for other purposes)
- `axios`: (If external APIs are needed)

## 💡 Key Discoveries
- [2026-02-26] Configuration requires silent MCP execution on Windows to avoid CMD popups (fixed).
- [2026-02-26] Project structure should follow the self-healing and validation loop patterns outlined in the assignment guides.
