# 🏁 Final Submission Checklist

Use this document to verify your implementation before submitting the assignment.

## 1. Environment Verification
- [ ] `backend/.env` is configured (MONGODB_URL, JWT_SECRET).
- [ ] `frontend/.env` points to `http://localhost:3000/api/v1`.
- [ ] Root `package.json` has `npm start` and `npm run dev` commands.

## 2. Feature Verification (Frontend)
- [ ] **Auth Flow**: Can register a new user and login successfully.
- [ ] **Protection**: Try to visit `/dashboard` while logged out (should redirect to `/login`).
- [ ] **CRUD**:
    - [ ] Create a task (Verify it appears in the list).
    - [ ] Update status (Verify icon/style changes).
    - [ ] Edit task (Verify modal populates existing data).
    - [ ] Delete task (Verify it disappears).
- [ ] **UX**: Verify toast messages appear for success/error.

## 3. Feature Verification (Backend)
- [ ] **Health Check**: Visit `http://localhost:3000/api/v1/health` (should return healthy DB status).
- [ ] **Validation**: Try to register with an invalid email (should see 400 Validation Error).
- [ ] **JSON Format**: All responses follow `{ success: true, data: ... }` format.

## 4. Interview "Talking Points" Ready
- [ ] **Scalability**: How would you handle 10,000 tasks? (Mention DB indexing and pagination implemented).
- [ ] **Security**: How is the password stored? (Mention Bcrypt salting and hashing).
- [ ] **Architecture**: Why separate controllers and services? (Mention Single Responsibility Principle).
- [ ] **Errors**: How do you handle random server errors? (Mention the Global Error Middleware).

---
**Next Step**: Once the DB is connected, run `npm start` and walk through the flow one last time! 🚀
