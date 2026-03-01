import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Clubs.css';

const CreateClub = () => {
  const navigate = useNavigate();
  const [form,        setForm]        = useState({ name: '', description: '', branch: 'All' });
  const [coverImage,  setCoverImage]  = useState(null);
  const [preview,     setPreview]     = useState('');
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('branch', form.branch);
      if (coverImage) formData.append('coverImage', coverImage);

      await axiosInstance.post('/clubs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Club created successfully!');
      setTimeout(() => navigate('/clubs'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clubs-page">
      <Navbar />

      <div className="create-club-body">
        <button className="cc-btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/clubs')}>
          <i className="fa-solid fa-arrow-left"></i>
          Back to Clubs
        </button>
        <div className="cc-card">
          <div className="create-club-title">Create a Club</div>
          <div className="create-club-sub">
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary-light)' }}></i>
            You will become the admin of this club
          </div>

          {success && <div className="cc-alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check"></i>{success}</div>}
          {error   && <div className="cc-alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Cover preview */}
            {preview
              ? <img src={preview} alt="cover" className="cover-preview" />
              : <div className="cover-placeholder">
                  <i className="fa-solid fa-image"></i>
                  No cover image selected
                </div>
            }

            <div style={{ marginBottom: 16 }}>
              <label className="cc-label">
                <i className="fa-solid fa-image" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Cover Image (optional)
              </label>
              <input type="file" accept="image/*" className="cc-input" style={{ padding: '6px 10px' }}
                onChange={handleImageChange} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="cc-label">
                <i className="fa-solid fa-signature" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Club Name
              </label>
              <input className="cc-input" placeholder="e.g. Coding Club, NSS, Robotics Club"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="cc-label">
                <i className="fa-solid fa-code-branch" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Branch
              </label>
              <select className="cc-select" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
                <option value="All">Common (NSS, Cultural, open to all)</option>
                <option value="CS">CS</option>
                <option value="IT">IT</option>
                <option value="ENTC">ENTC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div className="cc-hint" style={{ marginBottom: 16 }}>
              <i className="fa-solid fa-circle-info"></i>
              Select "Common" for clubs open to all branches
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="cc-label">
                <i className="fa-solid fa-align-left" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Description
              </label>
              <textarea className="cc-textarea" rows={4} placeholder="What is this club about?"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <button type="submit" className="cc-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</>
                : <><i className="fa-solid fa-plus"></i> Create Club</>
              }
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateClub;
