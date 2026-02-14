import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import API_BASE_URL from '../config/api.js';
import { useRef } from "react";
import { io } from "socket.io-client";
import { fetchMessages, sendMessage, getInbox } from '../services/messageService';

// Use the same base URL for socket connection but without the /api path
const SOCKET_URL = API_BASE_URL.replace('/api', '');

const Message = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${isOwn ? "bg-blue-500 text-white" : "bg-white text-gray-800 border"}`}>
        {message.content}
        <div className="text-[10px] text-right text-gray-300 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

const ChatWindow = ({ conversation, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect to socket
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: '/socket.io'
    });

    // Join user's room
    socketRef.current.emit('join', user._id);

    // Listen for messages
    socketRef.current.on('receive_message', handleNewMessage);
    socketRef.current.on('message_sent', handleNewMessage);
    socketRef.current.on('user_typing', handleUserTyping);
    socketRef.current.on('message_error', handleMessageError);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Load messages
  useEffect(() => {
    if (!conversation?._id || !user?._id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages(user._id, conversation._id);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Join conversation room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', {
        userId: user._id,
        conversationId: conversation._id
      });
    }

    // Set up polling for new messages as a fallback
    const messagePollingInterval = setInterval(loadMessages, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(messagePollingInterval);
    };
  }, [conversation, user]);

  // Handle new message
  const handleNewMessage = (message) => {
    setMessages(prev => {
      // Avoid duplicate messages
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
  };

  // Handle message error
  const handleMessageError = (error) => {
    console.error('Message error:', error);
    // Attempt to resend the message using the HTTP fallback
    if (error && error.messageData) {
      const { sender, receiver, content } = error.messageData;
      // Show a temporary message indicating retry
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        sender: { _id: sender },
        content: content + ' (retrying...)',
        timestamp: new Date()
      };
      handleNewMessage(tempMessage);

      // Try to send via HTTP
      sendMessage(sender, receiver, content)
        .then(response => {
          // Remove the temporary message and add the real one
          setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
          handleNewMessage(response);
        })
        .catch(err => {
          console.error('Failed to send message via HTTP fallback:', err);
          // Update the temporary message to show failure
          setMessages(prev => prev.map(m =>
            m._id === tempMessage._id
              ? { ...m, content: content + ' (failed to send)' }
              : m
          ));
        });
    }
  };

  // Handle typing indicator
  const handleUserTyping = ({ userId }) => {
    if (userId === conversation?._id) {
      setTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
    }
  };

  // Send typing status
  const handleTyping = () => {
    socketRef.current?.emit('typing', {
      from: user._id,
      to: conversation._id
    });
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender: user._id,
      receiver: conversation._id,
      content: newMessage
    };

    try {
      // Try to send via socket first
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', messageData);
      } else {
        // Fallback to HTTP if socket is not connected
        const response = await sendMessage(messageData.sender, messageData.receiver, messageData.content);
        handleNewMessage(response);
      }

      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) return <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">Select a conversation</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <img
          src={conversation?.profileImage || "/logo.png"}
          alt="avatar"
          className="h-10 w-10 rounded-full"
        />
        <div>
          <div className="font-semibold">{conversation?.userName}</div>
          {typing && (
            <div className="text-sm text-gray-500">typing...</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <Message
            key={msg._id}
            message={msg}
            isOwn={msg.sender._id === user._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            className="flex-1 rounded-lg border px-4 py-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const InboxPage = () => {
  const user = useSelector(state => state.user.userData);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const authorIdParam = searchParams.get('authorId');

  // Get conversations using the messageService
  useEffect(() => {
    if (!user?._id) return;

    let interval;
    const fetchInbox = async () => {
      setLoading(true);
      try {
        // Use the service function instead of direct axios call
        const conversations = await getInbox(user._id);
        setConversations(prev => {
          // Only update if changed
          const newUsers = conversations.map(c => c.user);
          if (JSON.stringify(prev.map(u => u._id)) !== JSON.stringify(newUsers.map(u => u._id))) {
            return newUsers;
          }
          return prev;
        });
        if (!selected && conversations.length > 0) setSelected(conversations[0].user);
      } catch (err) {
        console.error('Failed to fetch inbox:', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
    // Polling interval as fallback if socket updates fail
    interval = setInterval(fetchInbox, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Auto-open conversation when authorId is in URL
  useEffect(() => {
    if (!authorIdParam || !user?._id) return;

    // Check if author is already in conversations list
    const existing = conversations.find(u => u._id === authorIdParam);
    if (existing) {
      setSelected(existing);
      // Clear the query param so it doesn't re-trigger
      setSearchParams({}, { replace: true });
      return;
    }

    // Author not in conversations — fetch their profile and select them
    const fetchAuthorAndSelect = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/authors/${authorIdParam}`);
        const authorUser = res.data.user;
        if (authorUser) {
          // Add to conversations list if not already there
          setConversations(prev => {
            if (prev.some(u => u._id === authorUser._id)) return prev;
            return [authorUser, ...prev];
          });
          setSelected(authorUser);
        }
      } catch (err) {
        console.error('Failed to fetch author for chat:', err);
      }
      // Clear the query param
      setSearchParams({}, { replace: true });
    };

    fetchAuthorAndSelect();
  }, [authorIdParam, conversations, user]);

  // Search all users/authors
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/authors/search?query=${encodeURIComponent(search)}`);
        // Exclude self
        setSearchResults(res.data.filter(u => u._id !== user._id));
      } catch (err) {
        setSearchResults([]);
      }
      setSearching(false);
    };
    fetchUsers();
  }, [search, user]);

  // Show search results if searching, else show conversations
  const listToShow = search ? searchResults : conversations;

  const handleSelectUser = (u) => {
    setSelected(u);
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div className="container mx-auto px-2 py-8 flex flex-col md:flex-row h-[80vh] gap-4">
      {/* Left: Conversation List & Search */}
      <div className="w-full md:w-1/3 flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-4">Inbox</h1>
        <input
          type="text"
          placeholder="Search by username or email..."
          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 mb-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading && !search ? (
          <div className="text-gray-400 text-center">Loading...</div>
        ) : listToShow.length === 0 ? (
          <div className="text-gray-400 text-center">{search ? (searching ? 'Searching...' : 'No users/authors found.') : 'No conversations yet.'}</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-2 border border-gray-100 flex-1 overflow-y-auto">
            {listToShow.map(u => (
              <div
                key={u._id}
                className={`flex items-center gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer ${selected && selected._id === u._id ? 'bg-blue-100' : ''}`}
                onClick={() => handleSelectUser(u)}
              >
                <img src={u.profileImage || "/public/logo.png"} alt="avatar" className="h-8 w-8 rounded-full object-cover border" />
                <div>
                  <div className="font-semibold text-blue-700">{u.userName}</div>
                  <div className="text-xs text-gray-500">{u.userEmail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Right: Chat Window */}
      <div className="w-full md:w-2/3 flex flex-col h-full">
        <ChatWindow conversation={selected} user={user} />
      </div>
    </div>
  );
};

export default InboxPage;