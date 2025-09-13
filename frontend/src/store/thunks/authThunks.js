import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logoutUser,
} from "../../supabase/auth";

// Redux thunk for user registration - calls Supabase auth and returns user data
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      console.log("📝 Starting registration process...");
      const userCredential = await registerWithEmailAndPassword(
        email,
        password,
        fullName
      );
      console.log("✅ Registration successful - auth complete");

      // Return basic user info - AuthStateListener will handle full user data
      return {
        uid: userCredential.id,
        email: userCredential.email,
        displayName: userCredential.user_metadata?.full_name || fullName,
      };
    } catch (error) {
      console.error("💥 Registration failed:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Redux thunk for user login - calls Supabase auth and returns user data
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("🔑 Starting login process...");
      const userCredential = await loginWithEmailAndPassword(email, password);
      console.log("✅ Login successful - auth complete");

      // Return basic user info - AuthStateListener will handle full user data
      return {
        uid: userCredential.id,
        email: userCredential.email,
        displayName: userCredential.user_metadata?.full_name || "",
      };
    } catch (error) {
      console.error("💥 Login failed:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Redux thunk for user logout - calls Supabase logout and clears user data
export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error) {
      console.error("Logout failed:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Redux thunk for completing basic onboarding - sends data to backend API
export const completeBasicOnboarding = createAsyncThunk(
  "auth/completeBasicOnboarding",
  async (onboardingData, { rejectWithValue }) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/onboarding/basic`;
      console.log("ENV VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
      console.log("Making onboarding request to:", url);
      console.log("With data:", onboardingData);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/onboarding/basic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(onboardingData),
        }
      );

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      return data.user;
    } catch (error) {
      console.error("Onboarding API error:", error);
      return rejectWithValue(error.message);
    }
  }
);
