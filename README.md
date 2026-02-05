# Todo Application

A full-stack web application for task management with user authentication.

## Features

- User registration and login
- Create, read, update, and delete tasks
- Secure user data isolation
- Responsive web interface

## Technology Stack

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS
- **Backend**: Python 3.13+, FastAPI, SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT-based authentication

## Authentication Error Handling

This application includes robust error handling for authentication flows to prevent the common "Objects are not valid as a React child" error that occurs when FastAPI returns Pydantic validation errors.

### Problem
When the backend returns a 422 Validation Error from Pydantic, FastAPI returns a structured error object:
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "email"],
      "msg": "String should have at least 1 character",
      "input": "",
      "ctx": {"min_length": 1}
    }
  ]
}
```

But the frontend previously expected `err.detail` to be a simple string, causing React rendering errors.

### Solution
The frontend authentication service now normalizes error responses:

1. When backend returns a 422 validation error (array format), extract the message from the first error object
2. When backend returns a standard error (string format), use it directly
3. Always return a consistent error object with a string detail property

### Files Updated
- `frontend/src/services/auth.js` - Implements error normalization utility
- `frontend/src/components/Auth/Login.tsx` - Updated to handle normalized errors
- `frontend/src/components/Auth/Register.tsx` - Updated to handle normalized errors

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   # Using uv (recommended)
   uv pip install -r requirements.txt

   # Or using pip
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database_name
   NEON_DATABASE_URL=postgresql://username:password@host:port/database_name
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
   AUTH_SECRET=your-auth-secret-key
   APP_ENV=development
   DEBUG=True
   ```

4. Start the backend server:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_AUTH_SECRET=your-auth-secret-key
   NEXT_PUBLIC_APP_NAME=Todo Application
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Running the Application

1. Make sure your database tables are created (run `python create_tables.py` in backend)
2. Start the backend: `uvicorn src.main:app --reload --port 8000`
3. Start the frontend: `npm run dev`
4. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user

### Task Management
- `GET /api/tasks` - Get all user's tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status
- `DELETE /api/tasks/{id}` - Delete task