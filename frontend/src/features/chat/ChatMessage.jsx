import React from 'react';

const ChatMessage = ({ message, isUser, timestamp }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        <>
          <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
            <p className="text-gray-900 text-sm">{message}</p>
          </div>
          <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            You
          </div>
        </>
      ) : (
        <>
          <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            AI
          </div>
          <div className="bg-white rounded-lg px-4 py-2 max-w-xs lg:max-w-2xl">
            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMessage;