import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser, timestamp }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-content">
        <div className="message-text">{message}</div>
        <div className="message-time">{formatTime(timestamp)}</div>
      </div>
    </div>
  );
};

export default ChatMessage;