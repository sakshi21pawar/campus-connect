import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="cc-footer">
      <div className="cc-footer-inner">

        {/* Brand */}
        <div>
          <div className="cc-footer-brand">
            <i className="fa-solid fa-graduation-cap"></i>
            CampusConnect
          </div>
          <p className="cc-footer-tagline">
            Connecting campus, one student at a time. Share resources, build connections, and grow together.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <div className="cc-footer-title">Navigate</div>
          <div className="cc-footer-links">
            <button className="cc-footer-link" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-house" style={{ marginRight: 8 }}></i>Dashboard
            </button>
            <button className="cc-footer-link" onClick={() => navigate('/resources')}>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8 }}></i>Resources
            </button>
            <button className="cc-footer-link" onClick={() => navigate('/students')}>
              <i className="fa-solid fa-user-graduate" style={{ marginRight: 8 }}></i>Student Directory
            </button>
            <button className="cc-footer-link" onClick={() => navigate('/clubs')}>
              <i className="fa-solid fa-building-columns" style={{ marginRight: 8 }}></i>Clubs
            </button>
            <button className="cc-footer-link" onClick={() => navigate('/ai-assistant')}>
              <i className="fa-solid fa-robot" style={{ marginRight: 8 }}></i>AI Assistant
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="cc-footer-title">About</div>
          <p className="cc-footer-tagline" style={{ marginBottom: 12 }}>
            Built for students, by students. A platform to share knowledge and build your college network.
          </p>
          <p className="cc-footer-tagline">
            <i className="fa-solid fa-heart" style={{ color: '#E5A84B', marginRight: 6 }}></i>
            Made with love for college life
          </p>
        </div>

      </div>

      <hr className="cc-footer-divider" />
      <div className="cc-footer-bottom">
        © 2025 CampusConnect — All rights reserved
      </div>
    </footer>
  );
};

export default Footer;