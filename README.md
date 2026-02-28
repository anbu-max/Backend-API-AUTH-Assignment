# Student Management System

A comprehensive school portal and student management system built with the MERN stack (MongoDB, Express, React, Node.js). It provides a secure environment for teachers to manage student records and for students to view their profiles.

## Features

*   **Role-Based Access Control:** Distinct roles for Students and Teachers (Admins).
*   **Teacher/Admin Portal:** Teachers can create, view, update, and delete student records.
*   **Student Portal:** Students have read-only access to their own information.
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

## Uninstalling/Deleting Everything 

If you wish to fully remove the software and the database:
1.  **Delete the Directory:** Delete the `Backend-API-AUTH-Assignment` folder from your system.
2.  **Clear the Database:** If using MongoDB Atlas, log into your Atlas interface and drop the `assignment_db` database (or whichever path/name you specifically configured). If running locally, you can use a tool like MongoDB Compass to drop the database.
