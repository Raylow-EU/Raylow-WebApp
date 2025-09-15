import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createChatSession,
  sendMessage,
  fetchMessages,
  fetchChatSessions,
  deleteChatSession,
  setCurrentSession,
} from './chatSlice';
import ChatMessage from './ChatMessage';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose, regulationType = 'GDPR' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    sessions,
    currentSession,
    messages,
    loading
  } = useSelector(state => state.chat);

  const [messageInput, setMessageInput] = useState('');
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      const userId = user?.id || user?.uid;
      if (userId) {
        // Fetch existing sessions when modal opens
        dispatch(fetchChatSessions(userId));
        // Don't auto-create session, let user initiate
      }
    }
  }, [isOpen, user, dispatch]);

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

  const initializeChatSession = async () => {
    const userId = user?.id || user?.uid;
    if (userId) {
      // Generate a title with regulation type and date/time
      const now = new Date();
      const sessionTitle = `${regulationType} Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

      try {
        const result = await dispatch(createChatSession({
          userId,
          title: sessionTitle
        }));

        if (result.payload && !result.error) {
          setChatSession(result.payload);
          dispatch(setCurrentSession(result.payload));
          return result.payload;
        } else {
          console.error('Failed to create chat session:', result.error || result.payload);
          return null;
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
        return null;
      }
    }
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || loading.sending) {
      return;
    }

    const message = messageInput.trim();
    const userId = user?.id || user?.uid;

    // If no current session, create one now
    if (!currentSession) {
      const result = await initializeChatSession();
      if (result) {
        setMessageInput('');
        await dispatch(sendMessage({
          sessionId: result.id,
          userId,
          message
        }));
      }
      return;
    }

    setMessageInput('');
    await dispatch(sendMessage({
      sessionId: currentSession.id,
      userId,
      message
    }));
  };

  const handleClose = () => {
    // Clean up empty sessions when closing
    if (currentSession && messages.length === 0) {
      // If the current session has no messages, delete it
      const userId = user?.id || user?.uid;
      if (userId) {
        dispatch(deleteChatSession({ sessionId: currentSession.id, userId }));
      }
    }

    setChatSession(null);
    dispatch(setCurrentSession(null));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={handleClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <div className="ai-icon">🤖</div>
            <div>
              <h3>{regulationType} Assistant</h3>
              <p>Get instant help with compliance questions</p>
            </div>
          </div>
          <div className="header-actions">
            {sessions.length > 0 && (
              <select
                className="session-selector"
                value={currentSession?.id || ''}
                onChange={(e) => {
                  const sessionId = e.target.value;
                  if (sessionId) {
                    const session = sessions.find(s => s.id === sessionId);
                    if (session) {
                      dispatch(setCurrentSession(session));
                      setChatSession(session);
                    }
                  }
                }}
              >
                <option value="">Select previous chat...</option>
                {sessions.slice(0, 5).map(session => (
                  <option key={session.id} value={session.id}>
                    {session.title || 'Untitled Chat'}
                  </option>
                ))}
              </select>
            )}
            <button
              className="new-chat-button"
              onClick={() => {
                // If current session has no messages, just stay on it
                if (currentSession && messages.length === 0) {
                  return;
                }
                // Otherwise create new session
                initializeChatSession();
              }}
              title="Start new conversation"
            >
              + New
            </button>
            <button className="close-button" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        <div className="chat-modal-body">
          {loading.messages ? (
            <div className="loading">Starting conversation...</div>
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

        <form className="chat-modal-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Ask me anything about ${regulationType}...`}
            disabled={loading.sending}
            className="modal-message-input"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || loading.sending}
            className="modal-send-button"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;