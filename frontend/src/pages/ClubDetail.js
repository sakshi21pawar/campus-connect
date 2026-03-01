import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Clubs.css';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club,          setClub]          = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [form,          setForm]          = useState({ title: '', content: '', eventDate: '', venue: '' });
  const [success,       setSuccess]       = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/clubs/${id}`),
      axiosInstance.get(`/clubs/${id}/announcements`),
      axiosInstance.get('/users/profile'),
    ]).then(([clubRes, annRes, userRes]) => {
      setClub(clubRes.data);
      setAnnouncements(annRes.data);
      setCurrentUser(userRes.data);
    }).catch(() => navigate('/clubs'));
  }, [id, navigate]);

  const isAdmin = club && currentUser && club.createdBy?._id === currentUser._id;

  const handlePost = async e => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      const res = await axiosInstance.post(`/clubs/${id}/announcements`, form);
      setAnnouncements(prev => [res.data, ...prev]);
      setForm({ title: '', content: '', eventDate: '', venue: '' });
      setSuccess('Announcement posted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnn = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axiosInstance.delete(`/clubs/${id}/announcements/${annId}`);
      setAnnouncements(prev => prev.filter(a => a._id !== annId));
    } catch { alert('Could not delete'); }
  };

  if (!club) return (
    <div className="cc-loading">
      <i className="fa-solid fa-spinner fa-spin"></i>
      Loading club...
    </div>
  );

  return (
    <div className="clubs-page">
      <Navbar />

      <div className="club-detail-body">

        {/* Back */}
        <button className="cc-btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/clubs')}>
          <i className="fa-solid fa-arrow-left"></i>
          Back to Clubs
        </button>

        {/* Club Info */}
        <div className="cc-card">
          <div className="club-info-badge">
            <span className="cc-badge cc-badge-green">
              <i className="fa-solid fa-building-columns" style={{ marginRight: 4 }}></i>
              {club.branch === 'All' ? 'Common Club' : club.branch}
            </span>
          </div>
          <div className="club-info-name">{club.name}</div>
          <div className="club-info-meta">
            <span><i className="fa-solid fa-user"></i> {club.createdBy?.name}</span>
            <span><i className="fa-solid fa-code-branch"></i> {club.createdBy?.branch}</span>
            <span><i className="fa-solid fa-calendar"></i> Year {club.createdBy?.year}</span>
          </div>
          <div className="club-info-desc">{club.description || 'No description added'}</div>
        </div>

        {/* Post Announcement — admin only */}
        {isAdmin && (
          <div className="cc-card">
            <div className="club-form-title">
              <i className="fa-solid fa-bullhorn"></i>
              Post Announcement / Event
            </div>

            {success && <div className="cc-alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check"></i>{success}</div>}
            {error   && <div className="cc-alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

            <form onSubmit={handlePost}>
              <div style={{ marginBottom: 16 }}>
                <label className="cc-label">Title</label>
                <input className="cc-input" placeholder="e.g. Hackathon 2025, Workshop on AI"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="cc-label">Details</label>
                <textarea className="cc-textarea" rows={4} placeholder="Describe the event..."
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>

              <div className="club-form-row" style={{ marginBottom: 16 }}>
                <div>
                  <label className="cc-label">
                    <i className="fa-solid fa-calendar" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                    Event Date (optional)
                  </label>
                  <input type="date" className="cc-input"
                    value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} />
                </div>
                <div>
                  <label className="cc-label">
                    <i className="fa-solid fa-location-dot" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                    Venue (optional)
                  </label>
                  <input className="cc-input" placeholder="e.g. Seminar Hall, Online"
                    value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="cc-btn-primary" disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Posting...</>
                  : <><i className="fa-solid fa-bullhorn"></i> Post Announcement</>
                }
              </button>
            </form>
          </div>
        )}

        {/* Announcements list */}
        <div className="cc-card">
          <div className="section-header">
            <div className="section-title">
              <i className="fa-solid fa-clipboard-list"></i>
              Announcements & Events
            </div>
            <span className="cc-badge cc-badge-green">{announcements.length}</span>
          </div>

          {announcements.length === 0 ? (
            <div className="cc-empty">
              <i className="fa-solid fa-bell-slash"></i>
              No announcements yet
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann._id} className="club-ann-card">
                <div className="club-ann-title">{ann.title}</div>

                {(ann.eventDate || ann.venue) && (
                  <div className="club-ann-event-info">
                    {ann.eventDate && (
                      <span>
                        <i className="fa-solid fa-calendar"></i>
                        {new Date(ann.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {ann.venue && (
                      <span>
                        <i className="fa-solid fa-location-dot"></i>
                        {ann.venue}
                      </span>
                    )}
                  </div>
                )}

                <div className="club-ann-content">{ann.content}</div>

                <div className="club-ann-meta">
                  <span>
                    <i className="fa-solid fa-user" style={{ marginRight: 4 }}></i>
                    {ann.postedBy?.name} &nbsp;•&nbsp;
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                  {isAdmin && (
                    <button className="cc-btn-danger" onClick={() => handleDeleteAnn(ann._id)}>
                      <i className="fa-solid fa-trash"></i>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default ClubDetail;
