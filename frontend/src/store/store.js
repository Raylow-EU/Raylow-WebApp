import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "../features/chat/chatSlice";

// Saves Redux state to localStorage for persistence across browser sessions
const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (e) {
    console.error("Could not save state to localStorage", e);
  }
};

// Loads Redux state from localStorage on app startup
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state from localStorage", e);
    return undefined;
  }
};

// Load persisted state from localStorage
const persistedState = loadFromLocalStorage();

// Main Redux store configuration with auth and chat reducers and persistence
export const store = configureStore({
  reducer: {
    auth: authReducer, // Authentication state management
    chat: chatReducer, // Chat state management
  },
  preloadedState: persistedState, // Restore state from localStorage
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (user objects may contain non-serializable data)
        ignoredActions: ["auth/setUser"],
      },
    }),
});

// Auto-save state to localStorage whenever store changes
store.subscribe(() => {
  const state = store.getState();
  saveToLocalStorage(state);
});

// Export store utilities for direct access
export const getState = store.getState; // Get current state
export const dispatch = store.dispatch; // Dispatch actions
