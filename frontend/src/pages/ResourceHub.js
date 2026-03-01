import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Resources.css';

const typeBadgeClass = t => ({
  notes:          'cc-badge cc-badge-green',
  question_paper: 'cc-badge cc-badge-orange',
  assignment:     'cc-badge cc-badge-purple',
  video_link:     'cc-badge cc-badge-blue',
}[t] || 'cc-badge cc-badge-amber');

const typeLabel = t => ({
  notes:          'Notes',
  question_paper: 'Q. Paper',
  assignment:     'Assignment',
  video_link:     'Video',
}[t] || t);

const ResourceHub = () => {
  const navigate = useNavigate();
  const [resources,    setResources]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [filters,      setFilters]      = useState({ branch: '', year: '', type: '' });

  useEffect(() => {
    axiosInstance.get('/users/profile').then(res => setCurrentUser(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.branch) params.branch = filters.branch;
    if (filters.year)   params.year   = filters.year;
    if (filters.type)   params.type   = filters.type;
    axiosInstance.get('/resources', { params })
      .then(res => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleDelete = async id => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await axiosInstance.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch { alert('Could not delete'); }
  };

  const handleOpen = resource => {
    const url = resource.type === 'video_link' ? resource.videoUrl : resource.fileUrl;
    window.open(url, '_blank');
  };

  return (
    <div className="resources-page">
      <Navbar />

      <div className="resources-body">
        <div className="resources-topbar">
          <h1>
            <i className="fa-solid fa-book-open"></i>
            Resource Hub
          </h1>
          <button className="cc-btn-primary" onClick={() => navigate('/upload-resource')}>
            <i className="fa-solid fa-plus"></i>
            Upload Resource
          </button>
        </div>

        <div className="resources-filters">
          <select name="branch" className="cc-select" onChange={handleFilterChange}>
            <option value="">All Branches</option>
            <option value="CS">CS</option>
            <option value="IT">IT</option>
            <option value="ENTC">ENTC</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
          </select>
          <select name="year" className="cc-select" onChange={handleFilterChange}>
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <select name="type" className="cc-select" onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="notes">Notes</option>
            <option value="question_paper">Question Papers</option>
            <option value="assignment">Assignments</option>
            <option value="video_link">Video Links</option>
          </select>
        </div>

        {loading ? (
          <div className="cc-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="cc-empty">
            <i className="fa-solid fa-folder-open"></i>
            No resources found. Be the first to upload!
          </div>
        ) : (
          <div className="resources-grid">
            {resources.map(r => (
              <div key={r._id} className="resource-card">
                <div className="resource-card-top">
                  <div className="resource-card-title">{r.title}</div>
                  <span className={typeBadgeClass(r.type)}>{typeLabel(r.type)}</span>
                </div>
                <div className="resource-card-meta">
                  <i className="fa-solid fa-code-branch"></i>
                  {r.branch} &nbsp;•&nbsp; Year {r.year} &nbsp;•&nbsp; {r.subject}
                </div>
                {r.description && (
                  <div className="resource-card-desc">{r.description}</div>
                )}
                <div className="resource-card-footer">
                  <div className="resource-uploader">
                    <i className="fa-solid fa-user"></i>
                    {r.uploadedBy?.name || 'Unknown'}
                  </div>
                  <div className="resource-footer-btns">
                    {currentUser && r.uploadedBy?._id === currentUser._id && (
                      <button className="cc-btn-danger" onClick={() => handleDelete(r._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                    <button className="resource-open-card-btn" onClick={() => handleOpen(r)}>
                      <i className={`fa-solid ${r.type === 'video_link' ? 'fa-play' : 'fa-arrow-up-right-from-square'}`}></i>
                      {r.type === 'video_link' ? 'Watch' : 'Open'}
                    </button>
                  </div>
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

export default ResourceHub;