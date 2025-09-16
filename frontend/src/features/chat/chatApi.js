const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const chatApi = {
  // Create a new chat session
  createSession: async (userId, title = 'New Chat') => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat session');
    }

    return response.json();
  },

  // Get user's chat sessions
  getSessions: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch chat sessions');
    }

    return response.json();
  },

  // Send a message
  sendMessage: async (sessionId, userId, message) => {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, userId, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  // Get messages for a session
  getMessages: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`);

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  },

  // Delete a chat session
  deleteSession: async (sessionId, userId) => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat session');
    }

    return response.json();
  },
};