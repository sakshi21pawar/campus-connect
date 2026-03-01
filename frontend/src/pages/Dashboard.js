import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Dashboard.css';

const typeLabel = t => ({ notes:'Notes', question_paper:'Q.Paper', assignment:'Assignment', video_link:'Video' }[t] || t);
const typeBadgeClass = t => ({ notes:'cc-badge-green', question_paper:'cc-badge-orange', assignment:'cc-badge-purple', video_link:'cc-badge-blue' }[t] || 'cc-badge-green');

const quickAccessItems = [
  { icon: 'fa-book-open',          label: 'Resources',          path: '/resources' },
  { icon: 'fa-user-graduate',      label: 'Student Directory',  path: '/students' },
  { icon: 'fa-building-columns',   label: 'Clubs',              path: '/clubs' },
  { icon: 'fa-robot',              label: 'AI Assistant',       path: '/ai-assistant' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user,      setUser]      = useState(null);
  const [resources, setResources] = useState([]);
  const [events,    setEvents]    = useState([]);
  const [students,  setStudents]  = useState([]);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // ✅ Fetch user profile first — if this fails, token is invalid → logout
        const userRes = await axiosInstance.get('/users/profile');
        setUser(userRes.data);

        // ✅ Fetch rest independently — one failure won't crash everything
        const [resourceRes, clubsRes, studentsRes] = await Promise.allSettled([
          axiosInstance.get('/resources'),
          axiosInstance.get('/clubs'),
          axiosInstance.get('/users/students'),
        ]);

        // Resources
        if (resourceRes.status === 'fulfilled') {
          setResources(resourceRes.value.data.slice(0, 4));
        } else {
          console.error('Resources error:', resourceRes.reason);
        }

        // Students
        if (studentsRes.status === 'fulfilled') {
          setStudents(
            studentsRes.value.data
              .filter(s => s._id !== userRes.data._id)
              .slice(0, 6)
          );
        } else {
          console.error('Students error:', studentsRes.reason?.response?.data || studentsRes.reason);
        }

        // Events from clubs
        if (clubsRes.status === 'fulfilled') {
          const allAnnouncements = await Promise.all(
            clubsRes.value.data.map(club =>
              axiosInstance.get(`/clubs/${club._id}/announcements`)
                .then(res => res.data.map(ann => ({ ...ann, clubName: club.name })))
                .catch(() => [])
            )
          );

          const today = new Date();
          const upcoming = allAnnouncements
            .flat()
            .filter(ann => ann.eventDate && new Date(ann.eventDate) >= today)
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 4);

          setEvents(upcoming);
        } else {
          console.error('Clubs error:', clubsRes.reason);
        }

      } catch (err) {
        // Only reaches here if /users/profile fails
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchAll();
  }, [navigate]);

  if (!user) return (
    <div className="cc-loading">
      <i className="fa-solid fa-spinner fa-spin"></i>
      Loading your dashboard...
    </div>
  );

  return (
    <div className="dashboard-page">
      <Navbar />

      {/* ===== LAYOUT ===== */}
      <div className="dashboard-layout">

        {/* ===== SIDEBAR ===== */}
        <div className="dashboard-sidebar">

          {/* Profile Card */}
          <div className="cc-card profile-card">
            <div className="profile-cover" />
            <div className="profile-body">
              <div className="profile-avatar-wrap">
                {user.profilePic
                  ? <img src={user.profilePic} alt="profile" className="profile-avatar" />
                  : <div className="profile-avatar-letter">{user.name.charAt(0).toUpperCase()}</div>
                }
              </div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-meta">
                <i className="fa-solid fa-code-branch" style={{ color: 'var(--primary-light)', fontSize: 12 }}></i>
                {user.branch}
                <span style={{ color: 'var(--border)' }}>•</span>
                <i className="fa-solid fa-calendar" style={{ color: 'var(--primary-light)', fontSize: 12 }}></i>
                Year {user.year}
              </div>
              {user.bio && <div className="profile-bio">"{user.bio}"</div>}

              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-num">{user.skills?.length || 0}</div>
                  <div className="stat-label">Skills</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">{user.connections?.length || 0}</div>
                  <div className="stat-label">Connections</div>
                </div>
              </div>

              <button className="cc-btn-outline view-profile-btn" onClick={() => navigate('/profile')}>
                <i className="fa-solid fa-user"></i>
                View Profile
              </button>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="cc-card">
            <div className="quick-nav-title">Quick Access</div>
            {quickAccessItems.map(item => (
              <button key={item.path} className="quick-nav-item" onClick={() => navigate(item.path)}>
                <i className={`fa-solid ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </div>

        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="dashboard-main">

          {/* Profile nudge */}
          {(!user.bio || !user.skills?.length || !user.github) && (
            <div className="nudge-card">
              <div>
                <div className="nudge-text">
                  <i className="fa-solid fa-circle-info"></i>
                  Complete your profile
                </div>
                <div className="nudge-sub">Add bio, skills and links to get noticed by seniors</div>
              </div>
              <button className="nudge-btn" onClick={() => navigate('/edit-profile')}>
                Update Now
              </button>
            </div>
          )}

          {/* AI Banner */}
          <div className="ai-banner">
            <div className="ai-banner-left">
              <div className="ai-banner-title">
                <i className="fa-solid fa-robot"></i>
                CampusBot — Your AI Assistant
              </div>
              <div className="ai-banner-sub">Ask anything about placements, study tips, or campus life</div>
              <div className="ai-chips">
                <span className="ai-chip"><i className="fa-solid fa-briefcase"></i> Placement Prep</span>
                <span className="ai-chip"><i className="fa-solid fa-book-open"></i> Study Tips</span>
                <span className="ai-chip"><i className="fa-solid fa-building-columns"></i> Campus FAQs</span>
              </div>
            </div>
            <button className="ai-banner-btn" onClick={() => navigate('/ai-assistant')}>
              <i className="fa-solid fa-paper-plane"></i>
              Ask Now
            </button>
          </div>

          {/* People You May Know */}
          {students.length > 0 && (
            <div className="cc-card">
              <div className="section-header">
                <div className="section-title">
                  <i className="fa-solid fa-user-group"></i>
                  People You May Know
                </div>
                <button className="see-all-btn" onClick={() => navigate('/students')}>
                  See all <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }}></i>
                </button>
              </div>

              <div className="people-grid">
                {students.map(s => (
                  <div key={s._id} className="people-card">
                    {s.profilePic
                      ? <img src={s.profilePic} alt={s.name} className="people-avatar" />
                      : <div className="people-avatar-letter">{s.name.charAt(0).toUpperCase()}</div>
                    }
                    <div className="people-name">{s.name}</div>
                    <div className="people-meta">
                      {s.branch} • Year {s.year}
                    </div>
                    <button
                      className="cc-btn-outline people-connect-btn"
                      onClick={() => navigate(`/students/${s._id}`)}
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Resources */}
          <div className="cc-card">
            <div className="section-header">
              <div className="section-title">
                <i className="fa-solid fa-book-open"></i>
                Recent Resources
              </div>
              <button className="see-all-btn" onClick={() => navigate('/resources')}>
                See all <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }}></i>
              </button>
            </div>

            {resources.length === 0 ? (
              <div className="cc-empty">
                <i className="fa-solid fa-folder-open"></i>
                No resources uploaded yet
              </div>
            ) : (
              resources.map(r => (
                <div key={r._id} className="resource-item">
                  <div>
                    <div className="resource-name">{r.title}</div>
                    <div className="resource-meta">
                      <i className="fa-solid fa-code-branch"></i>
                      {r.branch} &nbsp;•&nbsp; Year {r.year} &nbsp;•&nbsp; {r.subject}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`cc-badge ${typeBadgeClass(r.type)}`}>{typeLabel(r.type)}</span>
                    <button
                      className="resource-open-btn"
                      onClick={() => window.open(r.type === 'video_link' ? r.videoUrl : r.fileUrl, '_blank')}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      Open
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Events */}
          <div className="cc-card">
            <div className="section-header">
              <div className="section-title">
                <i className="fa-solid fa-calendar-days"></i>
                Upcoming Events
              </div>
              <button className="see-all-btn" onClick={() => navigate('/clubs')}>
                See all clubs <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }}></i>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="cc-empty">
                <i className="fa-solid fa-calendar-xmark"></i>
                No upcoming events
              </div>
            ) : (
              events.map(event => (
                <div key={event._id} className="event-item">
                  <div className="event-title">{event.title}</div>
                  <div className="event-club">
                    <i className="fa-solid fa-building-columns"></i>
                    {event.clubName}
                  </div>
                  <div className="event-meta">
                    <span>
                      <i className="fa-solid fa-calendar"></i>
                      {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {event.venue && (
                      <span>
                        <i className="fa-solid fa-location-dot"></i>
                        {event.venue}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
