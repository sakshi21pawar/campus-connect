import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/theme.css';

const navItems = [
  { icon: 'fa-book-open',        label: 'Resources',  path: '/resources' },
  { icon: 'fa-user-graduate',    label: 'Directory',  path: '/students' },
  { icon: 'fa-building-columns', label: 'Clubs',      path: '/clubs' },
  { icon: 'fa-robot',            label: 'AI Bot',     path: '/ai-assistant' },
];

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = path => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await axiosInstance.get('/chat/unread/count');
        setUnreadCount(res.data.count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const MsgBadge = () => unreadCount > 0 ? (
    <span style={{
      position:'absolute', top:'4px', right:'4px',
      background:'#EF4444', color:'#fff',
      fontSize:'0.65rem', fontWeight:700,
      borderRadius:'99px', padding:'1px 5px',
      minWidth:'16px', textAlign:'center', lineHeight:'1.4',
    }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
  ) : null;

  return (
    <>
      <nav className="cc-navbar">
        <button className="cc-navbar-brand" onClick={() => navigate('/dashboard')}>
          <i className="fa-solid fa-graduation-cap"></i>
          CampusConnect
        </button>

        <div className="cc-navbar-links">
          {navItems.map(item => (
            <button key={item.path} className="cc-nav-btn"
              style={isActive(item.path) ? { background:'rgba(255,255,255,0.12)', color:'#fff' } : {}}
              onClick={() => navigate(item.path)}>
              <i className={`fa-solid ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
          <button className="cc-nav-btn" style={{ position:'relative', ...(isActive('/chat') ? { background:'rgba(255,255,255,0.12)', color:'#fff' } : {}) }}
            onClick={() => navigate('/chat')}>
            <i className="fa-solid fa-message"></i>
            Messages
            <MsgBadge />
          </button>
          <button className="cc-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>

        <button className="cc-hamburger" onClick={() => setMenuOpen(v => !v)}>
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </nav>

      <div className={`cc-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <button key={item.path} className="cc-nav-btn"
            onClick={() => { navigate(item.path); setMenuOpen(false); }}>
            <i className={`fa-solid ${item.icon}`}></i>
            {item.label}
          </button>
        ))}
        <button className="cc-nav-btn" style={{ position:'relative' }}
          onClick={() => { navigate('/chat'); setMenuOpen(false); }}>
          <i className="fa-solid fa-message"></i>
          Messages
          {unreadCount > 0 && <span style={{ background:'#EF4444', color:'#fff', fontSize:'0.65rem', fontWeight:700, borderRadius:'99px', padding:'1px 6px', marginLeft:6 }}>{unreadCount}</span>}
        </button>
        <button className="cc-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </>
  );
};

export default Navbar;