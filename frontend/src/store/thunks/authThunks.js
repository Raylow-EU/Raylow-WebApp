import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  logoutUser,
  fetchUserData,
} from "../../supabase/auth";

// Helper to extract serializable user data
const extractUserData = async (user) => {
  const baseData = {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || "",
  };

  // Fetch additional user data from Supabase
  try {
    const userData = await fetchUserData(user.id);
    return {
      ...baseData,
      isAdmin: userData?.isAdmin || false,
      onboardingCompleted: userData?.onboardingCompleted || false,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return baseData;
  }
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password, fullName, companyName, skipOnboarding },
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await registerWithEmailAndPassword(
        email,
        password,
        fullName,
        skipOnboarding ? { companyName } : null
      );
      const userData = await extractUserData(userCredential);
      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await loginWithEmailAndPassword(email, password);
      const userData = await extractUserData(userCredential);
      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  "auth/googleSignIn",
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await loginWithGoogle();
      const userData = await extractUserData(userCredential);
      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeBasicOnboarding = createAsyncThunk(
  "auth/completeBasicOnboarding",
  async (onboardingData, { rejectWithValue }) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/onboarding/basic`;
      console.log('ENV VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Making onboarding request to:', url);
      console.log('With data:', onboardingData);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/onboarding/basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      return data.user;
    } catch (error) {
      console.error('Onboarding API error:', error);
      return rejectWithValue(error.message);
    }
  }
);