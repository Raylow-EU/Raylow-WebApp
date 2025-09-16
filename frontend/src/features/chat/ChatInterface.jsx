import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createChatSession,
  fetchChatSessions,
  sendMessage,
  fetchMessages,
  deleteChatSession,
  setCurrentSession,
  clearCurrentSession
} from './chatSlice';
import ChatMessage from './ChatMessage';
import './ChatInterface.css';

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    sessions,
    currentSession,
    messages,
    loading,
    error
  } = useSelector(state => state.chat);

  const [messageInput, setMessageInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userId = user?.id || user?.uid;
    if (userId) {
      dispatch(fetchChatSessions(userId));
    }
  }, [dispatch, user]);


  useEffect(() => {
    if (currentSession) {
      dispatch(fetchMessages(currentSession.id));
    }
  }, [dispatch, currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    console.log('Attempting to create new chat session for user:', user);
    const userId = user?.id || user?.uid;
    if (userId) {
      // If current session has no messages, just stay on it
      if (currentSession && messages.length === 0) {
        return;
      }

      // Create new session only if current session has messages or no current session
      try {
        const now = new Date();
        const title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        const result = await dispatch(createChatSession({ userId, title }));
        console.log('Create chat session result:', result);
        if (result.error) {
          console.error('Failed to create chat session:', result.error);
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
      }
    } else {
      console.error('No user ID available for chat session creation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentSession || loading.sending) {
      return;
    }

    const message = messageInput.trim();
    setMessageInput('');

    await dispatch(sendMessage({
      sessionId: currentSession.id,
      userId: user.id || user.uid,
      message
    }));
  };

  const handleSessionSelect = (session) => {
    dispatch(setCurrentSession(session));
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await dispatch(deleteChatSession({ sessionId, userId: user.id || user.uid }));
    }
  };

  const formatSessionTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="chat-container">
        <div className="chat-error">Please log in to use the chat feature.</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`chat-sidebar ${showSidebar ? 'show' : 'hide'}`}>
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <button
            className="new-chat-btn"
            onClick={handleNewChat}
            disabled={loading.sessions}
          >
            + New Chat
          </button>
        </div>

        <div className="sessions-list">
          {loading.sessions && sessions.length === 0 ? (
            <div className="loading">Loading chats...</div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-content">
                  <div className="session-title">
                    {session.title || 'New Chat'}
                  </div>
                  <div className="session-time">
                    {formatSessionTime(session.updated_at)}
                  </div>
                </div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-header">
          <button
            className="sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            ☰
          </button>
          <h2>
            {currentSession ? (currentSession.title || 'Chat') : 'EU Regulations Assistant'}
          </h2>
        </div>

        {!currentSession ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h3>Welcome to Raylow AI Assistant</h3>
              <p>I'm here to help you with EU regulations and compliance questions.</p>
              <ul>
                <li>Ask about specific regulations like GDPR, AI Act, or CSRD</li>
                <li>Get compliance advice tailored to your company</li>
                <li>Understand regulatory requirements and deadlines</li>
              </ul>
              <button
                className="start-chat-btn"
                onClick={handleNewChat}
                disabled={loading.sessions}
              >
                Start a New Conversation
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="messages-container">
              {loading.messages ? (
                <div className="loading">Loading messages...</div>
              ) : (
                <>
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message.content}
                      isUser={message.role === 'user'}
                      timestamp={message.created_at}
                    />
                  ))}
                  {loading.sending && (
                    <div className="chat-message assistant">
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <div className="input-container">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask me about EU regulations..."
                  disabled={loading.sending}
                  className="message-input"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || loading.sending}
                  className="send-button"
                >
                  Send
                </button>
              </div>
              {error.sending && (
                <div className="error-message">
                  Failed to send message: {error.sending}
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;