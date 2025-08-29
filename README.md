# Raylow Landing Page & Authentication

This is a simplified version of the Raylow application that contains only the landing page and Firebase authentication system.

## Features

- **Landing Page**: Complete marketing website with Hero, Features, FAQ, and Footer sections
- **Authentication**: Email/password and Google OAuth signup/login
- **Redux State Management**: User authentication state persistence
- **Firebase Integration**: User authentication and basic user data storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefghijk
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server on port 8000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── Authentication/    # Login, Signup, AuthStateListener
│   └── LandingPage/      # Hero, Features, FAQ, Footer, etc.
├── firebase/             # Firebase config and auth functions
├── store/               # Redux store, slices, and thunks
├── assets/              # Images, fonts, and static assets
└── main.jsx            # Application entry point
```

## Routes

- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Simple protected route (placeholder)

This is a clean, production-ready starting point for the Raylow landing page and authentication system.