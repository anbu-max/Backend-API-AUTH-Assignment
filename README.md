# Student Management System

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</div>

A comprehensive school portal and student management system built with the MERN stack (MongoDB, Express, React, Node.js). It provides a secure environment for teachers to manage student records and for students to view their profiles.

## Features

*   **Role-Based Access Control:** Distinct roles for Students and Teachers (Admins).
*   **Teacher/Admin Portal:** Teachers can create, view, update, and delete student records.
*   **Student Portal:** Students have read-only access to view every student's grades and information, fostering transparency within the academic environment.
*   **Secure Authentication:** JWT-based user authentication.
*   **Teacher Registration Verification:** Specialized "School Password" requirement for creating Teacher accounts.

## Prerequisites

*   Node.js (v18 or higher recommended)
*   MongoDB (local or Atlas)

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/anbu-max/Backend-API-AUTH-Assignment.git
    cd Backend-API-AUTH-Assignment
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

## Configuration

To run the project, you'll need to configure `.env` files for both the frontend and backend. 

### Backend Environment Variables (`backend/.env`)

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_REGISTRATION_CODE=your_secret_admin_code
```

**Crucial:** The `ADMIN_REGISTRATION_CODE` variable serves as the "School Password". Anyone attempting to register or login as a Teacher will need to know this code. 

### Frontend Environment Variables (`frontend/.env`)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm start
    # The API will run on http://localhost:3000
    ```

2.  **Start the Frontend Client**
    ```bash
    cd frontend
    npm run dev
    # The application will be accessible at http://localhost:5173
    ```

## Usage: Registration & Login

### Registering as a Student
1. Navigate to the Registration page.
2. Fill out your details (First Name, Last Name, Email, Password).
3. Select "Student" from the role dropdown.
4. Click "Create Account".

### Registering as a Teacher (Admin)
1. Navigate to the Registration page.
2. Fill out your details.
3. Select "Teacher (Admin)" from the role dropdown.
4. An additional "School Password" field will appear. 
5. Enter the exact string corresponding to the `ADMIN_REGISTRATION_CODE` in your backend `.env` file.
6. Click "Create Account".

### Logging In
The login process relies on the identical mechanism. A Teacher must provide the "School Password" during login to ensure elevated credentials are not misused.

## Technical Architecture & Implementation Details

The backend API is designed following RESTful principles, featuring robust security and scalable architecture. Let's break down the technical core:

### Complete RESTful API Design
The platform exposes a highly organized, standard RESTful API structure mapped directly to HTTP verbs.
*   **`POST /api/v1/auth/register` & `/login`:** Securely creates user sessions or registers new entities. 
*   **`GET /api/v1/students`:** Retrieves a comprehensive list of all student records. Protected by JWT.
*   **`GET /api/v1/students/:id`:** Dynamically queries the NoSQL database for specific parameter-driven records.
*   **`PUT /api/v1/students/:id`:** Replaces or updates the attributes of an existing student. Role protected.
*   **`DELETE /api/v1/students/:id`:** Removes records permanently. Restricted exclusively to the Teacher (Admin) role.

### Enterprise-Grade Security & Authentication Management
*   **Cryptographic Password Hashing (Bcrypt):** Passwords are fully abstracted from the database. The system utilizes `bcrypt.js` with a high computational salt round (factor 12) during user registration. On `login`, strictly `bcrypt.compare()` is executed, verifying hash equivalence to prevent timing attacks.
*   **Advanced JWT Execution:** JWT (JSON Web Tokens) orchestrates the entire session lifecycle smoothly statelessly. 
    *   **Generation:** Upon passing the `bcrypt` verification, an `accessToken` is cryptographically signed using a secure `JWT_SECRET`. The payload specifically embeds the user's `_id` and `role`.
    *   **Middleware Verification:** Every protected route is shielded by an `auth.middleware.js` layer. It parses the `Authorization: Bearer <token>` header, verifies the signature, and mounts the decoded user onto the request pipeline (`req.user`), rejecting malicious or expired requests with an instant `401 Unauthorized`.
*   **Role-Based Access Control (RBAC):** Not all tokens are created equal. Secondary middleware checks the resolved token's `role`. While "Students" pass the auth check, only "Teachers" bypass the role-guard strictly applied over `POST`, `PUT`, and `DELETE` paths. 
*   **Strict Input Validation & Sanitization:** Routes leverage dedicated validation utilities (`validators.js`) verifying email regex parameters and enforcing strict type checking prior to executing Mongoose queries. This effectively mitigates primitive MongoDB NoSQL injection attempts.
*   **Centralized Error Handling:** Core application errors subclass natively to custom mappings (e.g. `AuthenticationError`, `ValidationError`). A global express error catcher intercepts any uncaught failure, preventing catastrophic crashes and filtering internal system logs from being exposed in public `500` status responses.

### Project Structure & Scalability
*   **Scalable Modular Sructure:** The node project is functionally layered into `routes`, `controllers`, `services`, and `models`. Each database entity holds its own segmented logic which makes it incredibly simple to add new systems, such as a future "Assignments" or "Classes" module seamlessly.
*   **Database Schema:** The MongoDB schemas utilize strict `Mongoose` validations with clean types, unique constraints and dynamic hooks to ensure perfectly uniform, indexable database layouts. 
*   **API Versioning:** All endpoints are strictly nested under `/api/v1/` to respect backwards compatibility when new upgrades are rolled out.

### Frontend Architecture & Libraries
*   **React & Vite Ecosystem:** Built on top of React 19 for maximum performance and lightning-fast HMR and build times provided seamlessly by Vite.
*   **State Management & Routing:** Leverages secure React Context API for application-wide authentication state and `react-router-dom` for robust client-side routing and protected boundaries.
*   **UI & Animations:** Designed with highly interactive UI aesthetics using vanilla CSS modules, `lucide-react` for beautifully consistent iconography, and `framer-motion` for complex page transitions and micro-animations.
*   **HTTP Interactions:** `axios` powers structured and cleanly formatted async HTTP requests back and forth from the Node.js backend to ensure smooth JSON data streaming.
*   **Toast Notifications:** Features `react-hot-toast` to provide instant, stylish visual feedback loops directly to users after API interactions (success/failure metrics).

## Key Deliverables Completed
1. Fully functional Authentication APIs (Register/Login).
2. Complete CRUD API operations constructed specifically for the Student Management dashboard. 
3. Included API documentation file in the repository (see Postman Collection inside the Git history or code structure).

## Uninstalling/Deleting Everything 

If you wish to fully remove the software and the database:
1.  **Delete the Directory:** Delete the `Backend-API-AUTH-Assignment` folder from your system.
2.  **Clear the Database:** If using MongoDB Atlas, log into your Atlas interface and drop the `assignment_db` database (or whichever path/name you specifically configured). If running locally, you can use a tool like MongoDB Compass to drop the database.
