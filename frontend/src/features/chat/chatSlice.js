import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from './chatApi';

// Async thunks
export const createChatSession = createAsyncThunk(
  'chat/createSession',
  async ({ userId, title }, { rejectWithValue }) => {
    try {
      return await chatApi.createSession(userId, title);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChatSessions = createAsyncThunk(
  'chat/fetchSessions',
  async (userId, { rejectWithValue }) => {
    try {
      return await chatApi.getSessions(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sessionId, userId, message }, { rejectWithValue }) => {
    try {
      return await chatApi.sendMessage(sessionId, userId, message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await chatApi.getMessages(sessionId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  'chat/deleteSession',
  async ({ sessionId, userId }, { rejectWithValue }) => {
    try {
      await chatApi.deleteSession(sessionId, userId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  loading: {
    sessions: false,
    messages: false,
    sending: false,
  },
  error: {
    sessions: null,
    messages: null,
    sending: null,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.messages = [];
    },
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null;
      } else {
        // Clear all errors
        Object.keys(state.error).forEach(key => {
          state.error[key] = null;
        });
      }
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create session
      .addCase(createChatSession.pending, (state) => {
        state.loading.sessions = true;
        state.error.sessions = null;
      })
      .addCase(createChatSession.fulfilled, (state, action) => {
        state.loading.sessions = false;
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
        state.messages = [];
      })
      .addCase(createChatSession.rejected, (state, action) => {
        state.loading.sessions = false;
        state.error.sessions = action.payload;
      })

      // Fetch sessions
      .addCase(fetchChatSessions.pending, (state) => {
        state.loading.sessions = true;
        state.error.sessions = null;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.loading.sessions = false;
        state.sessions = action.payload;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.loading.sessions = false;
        state.error.sessions = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        const { userMessage, assistantMessage } = action.payload;
        state.messages.push(userMessage);
        state.messages.push(assistantMessage);

        // Update session's updated_at timestamp
        if (state.currentSession) {
          const sessionIndex = state.sessions.findIndex(s => s.id === state.currentSession.id);
          if (sessionIndex !== -1) {
            state.sessions[sessionIndex].updated_at = new Date().toISOString();
            // Move to front of list
            const session = state.sessions.splice(sessionIndex, 1)[0];
            state.sessions.unshift(session);
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error.messages = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error.messages = action.payload;
      })

      // Delete session
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        const sessionId = action.payload;
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        if (state.currentSession?.id === sessionId) {
          state.currentSession = null;
          state.messages = [];
        }
      });
  },
});

export const { setCurrentSession, clearError, clearCurrentSession } = chatSlice.actions;

export default chatSlice.reducer;