import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Chat.css';

const SOCKET_URL = 'http://localhost:5000';

const Chat = () => {
  const navigate               = useNavigate();
  const { userId: paramUserId } = useParams();

  const socketRef              = useRef(null);
  const messagesEndRef         = useRef(null);
  const typingTimerRef         = useRef(null);

  const [currentUser,    setCurrentUser]    = useState(null);
  const [conversations,  setConversations]  = useState([]);
  const [activeChat,     setActiveChat]     = useState(null); // { _id, name, profilePic }
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState('');
  const [onlineUsers,    setOnlineUsers]    = useState([]);
  const [isTyping,       setIsTyping]       = useState(false);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [sending,        setSending]        = useState(false);

  // ── Connect Socket.io ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socketRef.current.on('onlineUsers', (users) => setOnlineUsers(users));

    socketRef.current.on('userTyping',     ({ from }) => {
      if (activeChat && from === activeChat._id) setIsTyping(true);
    });
    socketRef.current.on('userStopTyping', ({ from }) => {
      if (activeChat && from === activeChat._id) setIsTyping(false);
    });

    socketRef.current.on('newMessageNotification', () => {
      fetchConversations();
    });

    return () => socketRef.current?.disconnect();
  // eslint-disable-next-line
  }, [navigate]);

  // ── Fetch current user ─────────────────────────────────────
  useEffect(() => {
    axiosInstance.get('/users/profile')
      .then(res => setCurrentUser(res.data))
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  // ── Fetch conversations ────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/chat/conversations');
      setConversations(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Open chat from URL param ───────────────────────────────
  useEffect(() => {
    if (!paramUserId || !currentUser) return;
    axiosInstance.get(`/users/${paramUserId}`)
      .then(res => openChat(res.data))
      .catch(() => navigate('/chat'));
  // eslint-disable-next-line
  }, [paramUserId, currentUser]);

  // ── Open a chat window ─────────────────────────────────────
  const openChat = async (user) => {
    setActiveChat(user);
    setMessages([]);
    setIsTyping(false);
    setLoadingMsgs(true);
    navigate(`/chat/${user._id}`, { replace: true });
    try {
      const res = await axiosInstance.get(`/chat/${user._id}`);
      setMessages(res.data);
      // Mark as read via socket
      socketRef.current?.emit('markRead', { senderId: user._id });
      // Refresh conversations to clear badge
      fetchConversations();
    } catch (err) { console.error(err); }
    finally { setLoadingMsgs(false); }
  };

  // ── Auto scroll to bottom ──────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send message ───────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeChat || sending) return;
    setSending(true);
    setInput('');

    socketRef.current?.emit('sendMessage', {
      receiverId: activeChat._id,
      text,
    });

    socketRef.current?.emit('stopTyping', { receiverId: activeChat._id });
    setSending(false);
    fetchConversations();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Typing indicator ───────────────────────────────────────
  const handleInputChange = e => {
    setInput(e.target.value);
    if (!activeChat) return;
    socketRef.current?.emit('typing', { receiverId: activeChat._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { receiverId: activeChat._id });
    }, 1500);
  };

  // ── Helpers ────────────────────────────────────────────────
  const isOnline = id => onlineUsers.includes(id?.toString());

  const formatTime = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = dateStr => {
    const d   = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = () => {
    const groups = [];
    let lastDate = null;
    for (const msg of messages) {
      const date = new Date(msg.createdAt).toDateString();
      if (date !== lastDate) {
        groups.push({ type: 'date', label: formatDate(msg.createdAt) });
        lastDate = date;
      }
      groups.push({ type: 'msg', msg });
    }
    return groups;
  };

  if (!currentUser) return (
    <div className="cc-loading">
      <i className="fa-solid fa-spinner fa-spin"></i>
      Loading...
    </div>
  );

  return (
    <div className="chat-page">
      <Navbar />

      <div className="chat-layout">

        {/* ── Sidebar: Conversation List ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2><i className="fa-solid fa-message"></i> Messages</h2>
            <span className="chat-conv-count">{conversations.length}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="chat-empty-conv">
              <i className="fa-solid fa-comments"></i>
              <p>No conversations yet</p>
              <span>Connect with students to start chatting</span>
              <button className="cc-btn-primary" style={{ marginTop: 12, fontSize: '0.85rem' }}
                onClick={() => navigate('/students')}>
                Browse Students
              </button>
            </div>
          ) : (
            <div className="chat-conv-list">
              {conversations.map(conv => (
                <div
                  key={conv.user._id}
                  className={`chat-conv-item ${activeChat?._id === conv.user._id ? 'active' : ''}`}
                  onClick={() => openChat(conv.user)}
                >
                  <div className="chat-conv-avatar-wrap">
                    {conv.user.profilePic
                      ? <img src={conv.user.profilePic} alt={conv.user.name} className="chat-conv-avatar" />
                      : <div className="chat-conv-avatar-letter">{conv.user.name.charAt(0).toUpperCase()}</div>
                    }
                    {isOnline(conv.user._id) && <span className="chat-online-dot" />}
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-name">{conv.user.name}</div>
                    <div className="chat-conv-last">
                      {conv.lastMessage?.sender?._id === currentUser._id ? 'You: ' : ''}
                      {conv.lastMessage?.text?.slice(0, 35)}
                      {conv.lastMessage?.text?.length > 35 ? '...' : ''}
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="chat-unread-badge">{conv.unread}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main: Chat Window ── */}
        <main className="chat-main">
          {!activeChat ? (
            <div className="chat-no-active">
              <div className="chat-no-active-icon">
                <i className="fa-solid fa-comments"></i>
              </div>
              <h3>Select a conversation</h3>
              <p>Choose someone from the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="chat-back-btn" onClick={() => {
                  setActiveChat(null);
                  navigate('/chat', { replace: true });
                }}>
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="chat-header-avatar-wrap">
                  {activeChat.profilePic
                    ? <img src={activeChat.profilePic} alt={activeChat.name} className="chat-header-avatar" />
                    : <div className="chat-header-avatar-letter">{activeChat.name.charAt(0).toUpperCase()}</div>
                  }
                  {isOnline(activeChat._id) && <span className="chat-online-dot" />}
                </div>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeChat.name}</div>
                  <div className="chat-header-status">
                    {isOnline(activeChat._id) ? (
                      <><span className="status-dot-online" /> Online</>
                    ) : (
                      <><span className="status-dot-offline" /> Offline</>
                    )}
                  </div>
                </div>
                <button className="cc-btn-outline chat-profile-btn"
                  onClick={() => navigate(`/students/${activeChat._id}`)}>
                  <i className="fa-solid fa-user"></i>
                  Profile
                </button>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {loadingMsgs ? (
                  <div className="cc-loading"><i className="fa-solid fa-spinner fa-spin"></i></div>
                ) : messages.length === 0 ? (
                  <div className="chat-msg-empty">
                    <i className="fa-solid fa-hand-wave"></i>
                    <p>Say hello to <strong>{activeChat.name}</strong>!</p>
                  </div>
                ) : (
                  groupedMessages().map((item, i) =>
                    item.type === 'date' ? (
                      <div key={`date-${i}`} className="chat-date-divider">
                        <span>{item.label}</span>
                      </div>
                    ) : (
                      <div
                        key={item.msg._id}
                        className={`chat-bubble-wrap ${item.msg.sender._id === currentUser._id ? 'mine' : 'theirs'}`}
                      >
                        {item.msg.sender._id !== currentUser._id && (
                          <div className="chat-bubble-avatar">
                            {activeChat.profilePic
                              ? <img src={activeChat.profilePic} alt="" />
                              : <div className="chat-bubble-avatar-letter">{activeChat.name.charAt(0)}</div>
                            }
                          </div>
                        )}
                        <div className="chat-bubble-col">
                          <div className={`chat-bubble ${item.msg.sender._id === currentUser._id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>
                            {item.msg.text}
                          </div>
                          <div className="chat-bubble-time">
                            {formatTime(item.msg.createdAt)}
                            {item.msg.sender._id === currentUser._id && (
                              <i className={`fa-solid fa-check${item.msg.read ? '-double' : ''}`}
                                style={{ marginLeft: 4, fontSize: '0.65rem', color: item.msg.read ? 'var(--primary)' : 'var(--text-3)' }}>
                              </i>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="chat-bubble-wrap theirs">
                    <div className="chat-bubble-avatar">
                      {activeChat.profilePic
                        ? <img src={activeChat.profilePic} alt="" />
                        : <div className="chat-bubble-avatar-letter">{activeChat.name.charAt(0)}</div>
                      }
                    </div>
                    <div className="chat-typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-area">
                <textarea
                  className="chat-input"
                  rows={1}
                  placeholder={`Message ${activeChat.name}...`}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Chat;