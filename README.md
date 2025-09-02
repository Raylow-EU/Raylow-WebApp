# Raylow Application

A full-stack web application with React frontend and Node.js backend, using Supabase for authentication and data management.

## Project Structure

```
Frontend_new/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Redux store and slices
│   │   ├── supabase/      # Supabase configuration and auth
│   │   └── ...
│   ├── package.json
│   └── .env.example
├── backend/               # Node.js backend API
│   ├── config/           # Configuration files
│   ├── routes/           # Express routes
│   ├── middleware/       # Express middleware
│   ├── server.js         # Main server file
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### 1. Clone and Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Environment Configuration

#### Frontend (.env)

Copy `frontend/.env.example` to `frontend/.env` and configure:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Raylow
```

#### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Supabase Database Setup

Create the following tables in your Supabase project:

#### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Onboarding Table

```sql
CREATE TABLE user_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  company_name VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Running the Application

#### Development Mode

Start both frontend and backend:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

#### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## Architecture Overview

### Frontend (React + Vite)

- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth (client-side)
- **UI Components**: Custom components with Lucide React icons
- **Routing**: React Router DOM
- **Styling**: CSS modules/Tailwind (based on existing setup)

### Backend (Node.js + Express)

- **Framework**: Express.js
- **Authentication**: Supabase Auth (server-side verification)
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS, JWT tokens
- **Logging**: Morgan

### Database (Supabase)

- **Authentication**: Built-in Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Storage**: Supabase Storage (if needed)

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile/:userId` - Get user profile

## Key Features

1. **Modern Architecture**: Separated frontend and backend
2. **Supabase Integration**: Modern auth and database solution
3. **Type Safety**: ESLint configuration for code quality
4. **Security**: Helmet, CORS, and JWT authentication
5. **Development Tools**: Hot reload for both frontend and backend

## Migration from Firebase

This project has been migrated from Firebase to Supabase:

- ✅ Authentication moved from Firebase Auth to Supabase Auth
- ✅ Database queries updated from Firestore to Supabase
- ✅ Frontend auth state management updated
- ✅ Backend API endpoints created for enhanced functionality

## Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Environment Variables Reference

### Frontend

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API base URL

### Backend

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time
