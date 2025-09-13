import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUserThunk,
  completeBasicOnboarding,
} from "../thunks/authThunks";

// Initial state for authentication slice
const initialState = {
  user: null, // Current authenticated user data
  loading: false, // Loading state for auth operations
  error: null, // Error messages from auth operations
};

// Redux slice that manages authentication state and actions
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log("setUser reducer called with:", action.payload); // Debug log
      state.user = action.payload; // Set current user data
      state.error = null; // Clear any errors
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // Set loading state
    },
    setError: (state, action) => {
      state.error = action.payload; // Set error message
      state.loading = false; // Stop loading on error
    },
    logout: (state) => {
      state.user = null; // Clear user data
      state.error = null; // Clear errors
    },
  },
  // Handles async thunk actions (login, register, logout, onboarding)
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Onboarding cases
      .addCase(completeBasicOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeBasicOnboarding.fulfilled, (state, action) => {
        console.log(
          "🎯 completeBasicOnboarding.fulfilled - payload:",
          action.payload
        );
        state.loading = false;
        if (state.user) {
          const updatedUser = {
            ...state.user,
            onboardingBasicCompleted: action.payload.onboardingBasicCompleted,
            displayName: action.payload.fullName,
            companyId: action.payload.companyId,
            companyRole: action.payload.companyRole,
          };
          console.log(
            "🎯 completeBasicOnboarding.fulfilled - updating user to:",
            updatedUser
          );
          state.user = updatedUser;
        }
        state.error = null;
      })
      .addCase(completeBasicOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
