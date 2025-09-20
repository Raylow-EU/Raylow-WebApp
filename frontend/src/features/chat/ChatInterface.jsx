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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Plus,
  Send,
  Menu,
  Trash2,
  Bot,
  User,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react";

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Debug user object
  console.log('User object in chat:', user);
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
    console.log('Starting new chat...');
    // Just clear the current session to show the welcome screen
    // We'll create the actual session when user sends first message
    dispatch(clearCurrentSession());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || loading.sending) {
      return;
    }

    const message = messageInput.trim();
    setMessageInput('');

    // If no current session, create one first
    if (!currentSession) {
      const userId = user?.id || user?.uid;
      const now = new Date();
      const title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

      const result = await dispatch(createChatSession({ userId, title }));
      if (result.error) {
        console.error('Failed to create chat session:', result.error);
        return;
      }

      // The session should now be set as current, proceed with sending message
      const sessionId = result.payload?.id;
      if (sessionId) {
        await dispatch(sendMessage({
          sessionId,
          userId,
          message
        }));
      }
    } else {
      await dispatch(sendMessage({
        sessionId: currentSession.id,
        userId: user.id || user.uid,
        message
      }));
    }
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
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white" style={{ margin: '-2rem', width: 'calc(100% + 4rem)', height: '100vh' }}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-200 bg-gray-50 border-r border-gray-200 overflow-hidden flex flex-col`}>
        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            disabled={loading.sessions}
            className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3">
          {loading.sessions && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`group relative cursor-pointer rounded-lg p-3 text-sm hover:bg-gray-200 ${
                    currentSession?.id === session.id ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handleSessionSelect(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 truncate text-gray-900">
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      {session.title || 'New Chat'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Chat Header */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-600 hover:bg-gray-100 p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {currentSession ? (currentSession.title || 'Raylow Assistant') : 'Raylow Assistant'}
            </h1>
          </div>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        {!currentSession ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="text-center w-full max-w-3xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Good to see you, {user?.displayName?.split(' ')[0] || user?.fullName?.split(' ')[0] || user?.firstName || user?.name || user?.email?.split('@')[0] || 'there'}
              </h2>

              {/* Input Area centered below greeting */}
              <div className="w-full">
                <form onSubmit={handleSendMessage}>
                  <div className="relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Ask about EU regulations..."
                      disabled={loading.sending}
                      className="w-full px-6 py-3 pr-14 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-base"
                      style={{ borderRadius: '24px' }}
                    />
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || loading.sending}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-orange-500 hover:bg-orange-600 rounded-md p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {error.sending && (
                    <div className="mt-2 text-sm text-red-600">
                      Failed to send message: {error.sending}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                {loading.messages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6 py-6 px-4">
                    {messages.map(message => (
                      <ChatMessage
                        key={message.id}
                        message={message.content}
                        isUser={message.role === 'user'}
                        timestamp={message.created_at}
                      />
                    ))}
                    {loading.sending && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            AI
                          </div>
                          <div className="bg-white rounded-lg px-4 py-2 max-w-xs">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              <div className="max-w-3xl mx-auto p-4">
                <form onSubmit={handleSendMessage}>
                  <div className="relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Ask about EU regulations..."
                      disabled={loading.sending}
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || loading.sending}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-orange-500 hover:bg-orange-600 rounded-md p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {error.sending && (
                    <div className="mt-2 text-sm text-red-600">
                      Failed to send message: {error.sending}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;