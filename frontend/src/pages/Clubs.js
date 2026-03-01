import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Clubs.css';

const Clubs = () => {
  const navigate = useNavigate();
  const [clubs,        setClubs]        = useState([]);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    axiosInstance.get('/users/profile').then(r => setCurrentUser(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = branchFilter ? { branch: branchFilter } : {};
    axiosInstance.get('/clubs', { params })
      .then(r => setClubs(r.data))
      .finally(() => setLoading(false));
  }, [branchFilter]);

  const handleDelete = async (e, clubId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this club and all its announcements?')) return;
    try {
      await axiosInstance.delete(`/clubs/${clubId}`);
      setClubs(prev => prev.filter(c => c._id !== clubId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div className="clubs-page">
      <Navbar />

      <div className="clubs-body">
        <div className="clubs-topbar">
          <h1>
            <i className="fa-solid fa-building-columns"></i>
            Clubs
          </h1>
          <button className="cc-btn-primary" onClick={() => navigate('/clubs/create')}>
            <i className="fa-solid fa-plus"></i>
            Create Club
          </button>
        </div>

        <div className="clubs-filter-row">
          <select className="cc-select" style={{ maxWidth: 200 }} onChange={e => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            <option value="CS">CS</option>
            <option value="IT">IT</option>
            <option value="ENTC">ENTC</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>

        {loading ? (
          <div className="cc-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            Loading clubs...
          </div>
        ) : clubs.length === 0 ? (
          <div className="cc-empty">
            <i className="fa-solid fa-building-columns"></i>
            No clubs found. Be the first to create one!
          </div>
        ) : (
          <div className="clubs-grid">
            {clubs.map(club => (
              <div key={club._id} className="club-card" onClick={() => navigate(`/clubs/${club._id}`)}>
                {club.coverImage
                  ? <img src={club.coverImage} alt={club.name} className="club-cover" />
                  : <div className="club-cover-default">
                      <i className="fa-solid fa-building-columns"></i>
                    </div>
                }
                <div className="club-card-body">
                  <div className="club-card-top">
                    <div className="club-card-name">{club.name}</div>
                    <span className="cc-badge cc-badge-green">
                      {club.branch === 'All' ? 'Common' : club.branch}
                    </span>
                  </div>
                  <div className="club-card-desc">
                    {club.description || 'No description added'}
                  </div>
                  <div className="club-card-footer">
                    <i className="fa-solid fa-user"></i>
                    {club.createdBy?.name}
                  </div>
                  {currentUser?._id === club.createdBy?._id && (
                    <button
                      className="cc-btn-danger"
                      style={{ marginTop: 10 }}
                      onClick={e => handleDelete(e, club._id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                      Delete Club
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Clubs;
