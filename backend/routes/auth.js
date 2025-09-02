import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, companyName, skipOnboarding } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          company_name: companyName || null,
          is_admin: false,
          onboarding_completed: skipOnboarding || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (dbError) {
      // If user creation failed, cleanup the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Create onboarding record if needed
    if (skipOnboarding && companyName) {
      await supabase
        .from('user_onboarding')
        .insert([
          {
            user_id: authData.user.id,
            company_name: companyName,
            completed: true,
            completed_at: new Date().toISOString(),
            is_admin: false,
          }
        ]);
    }

    const token = generateToken(authData.user.id);

    res.status(201).json({
      user: {
        uid: authData.user.id,
        email: authData.user.email,
        displayName: fullName,
        isAdmin: false,
        onboardingCompleted: skipOnboarding || false,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const token = generateToken(authData.user.id);

    res.json({
      user: {
        uid: authData.user.id,
        email: authData.user.email,
        displayName: userData.full_name,
        isAdmin: userData.is_admin,
        onboardingCompleted: userData.onboarding_completed,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Verify Google token and sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    // Check if user profile exists, create if not
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create profile
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata.full_name || authData.user.user_metadata.name || '',
            is_admin: false,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      userData = newUserData;
    } else if (userError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const token = generateToken(authData.user.id);

    res.json({
      user: {
        uid: authData.user.id,
        email: authData.user.email,
        displayName: userData.full_name,
        isAdmin: userData.is_admin,
        onboardingCompleted: userData.onboarding_completed,
      },
      token,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // Since we're using JWT tokens, logout is handled client-side
    // But we can add token blacklisting logic here if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: userData.id,
      email: userData.email,
      displayName: userData.full_name,
      isAdmin: userData.is_admin,
      onboardingCompleted: userData.onboarding_completed,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;