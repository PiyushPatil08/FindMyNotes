import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import API_BASE_URL from '../config/api.js';


const ChatWindow = ({ conversation, user, onSend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef(null);
  const lastMessageId = React.useRef(null);
  const initialLoad = React.useRef(true);

  // Poll for messages
  useEffect(() => {
    let interval;
    const fetchMessages = async () => {
      if (!conversation) return;
      if (initialLoad.current) {
        setLoading(true);
      }
      const res = await axios.get(`${API_BASE_URL}/messages/${user._id}/${conversation._id}`);
      setMessages(res.data);
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    };
    fetchMessages();
    interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversation, user]);

  // Reset initialLoad when conversation changes
  useEffect(() => {
    initialLoad.current = true;
  }, [conversation?._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length === 0) return;
    const currentLastId = messages[messages.length - 1]._id;
    if (lastMessageId.current !== currentLastId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        lastMessageId.current = currentLastId;
      }, 0);
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await axios.post("http://localhost:6969/messages", {
      sender: user._id,
      receiver: conversation._id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    if (onSend) onSend();
  };

  if (!conversation) return <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">Select a conversation</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-2 bg-white rounded-xl shadow p-4 border border-gray-100">
        <img src={conversation.profileImage || "/public/logo.png"} alt="avatar" className="h-10 w-10 rounded-full object-cover border-2 border-blue-100 shadow-sm" />
        <div>
          <div className="text-base font-bold text-blue-700">{conversation.userName || conversation.userEmail || "User"}</div>
          <div className="text-xs text-gray-500">{conversation.userEmail}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-4 mb-2 border border-gray-100">
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet. Say hello!</div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender._id === user._id ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${msg.sender._id === user._id ? "bg-blue-500 text-white" : "bg-white text-gray-800 border"}`}>
                  {msg.content}
                  <div className="text-[10px] text-right text-gray-300 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form className="flex gap-2" onSubmit={handleSend}>
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
        >
          Send
        </button>
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

  // Poll for conversations
  useEffect(() => {
    let interval;
    const fetchInbox = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/messages/inbox/${user._id}`);
        setConversations(prev => {
          // Only update if changed
          const newUsers = res.data.map(c => c.user);
          if (JSON.stringify(prev.map(u => u._id)) !== JSON.stringify(newUsers.map(u => u._id))) {
            return newUsers;
          }
          return prev;
        });
        if (!selected && res.data.length > 0) setSelected(res.data[0].user);
      } catch (err) {
        setConversations([]);
      }
      setLoading(false);
    };
    fetchInbox();
    interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, [user, selected]);

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