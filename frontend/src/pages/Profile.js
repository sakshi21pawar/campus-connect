import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Profile.css';

const Profile = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef();
  const [user,      setUser]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    axiosInstance.get('/users/profile')
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  const handlePicUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const res = await axiosInstance.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      setUploadMsg('Profile picture updated!');
      setTimeout(() => setUploadMsg(''), 3000);
    } catch {
      setUploadMsg('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return (
    <div className="cc-loading">
      <i className="fa-solid fa-spinner fa-spin"></i>
      Loading profile...
    </div>
  );

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-body">

        {/* Main Info Card */}
        <div className="cc-card">
          <div className="profile-top-row">

            {/* Avatar */}
            <div className="profile-pic-wrap">
              {user.profilePic
                ? <img src={user.profilePic} alt="profile" className="profile-pic" />
                : <div className="profile-pic-letter">{user.name.charAt(0).toUpperCase()}</div>
              }
              <div className="profile-cam-btn" onClick={() => fileRef.current.click()}>
                <i className="fa-solid fa-camera"></i>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
            </div>

            <div>
              <div className="profile-info-name">{user.name}</div>
              <div className="profile-info-email">
                <i className="fa-solid fa-envelope"></i>
                {user.email}
              </div>
              <span className="cc-badge cc-badge-green">
                <i className="fa-solid fa-user" style={{ marginRight: 4 }}></i>
                {user.role}
              </span>
              {uploading && (
                <div className="profile-upload-msg">
                  <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                </div>
              )}
              {uploadMsg && (
                <div className="profile-upload-msg">
                  <i className="fa-solid fa-circle-check"></i> {uploadMsg}
                </div>
              )}
            </div>
          </div>

          <div className="profile-pill-row">
            <span className="profile-pill">
              <i className="fa-solid fa-code-branch"></i>
              {user.branch}
            </span>
            <span className="profile-pill">
              <i className="fa-solid fa-calendar"></i>
              Year {user.year}
            </span>
          </div>

          <div className="profile-sec-label">
            <i className="fa-solid fa-align-left"></i>
            Bio
          </div>
          {user.bio
            ? <p className="profile-bio-text">{user.bio}</p>
            : <p className="profile-empty">No bio added yet — <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/edit-profile')}>add one</span></p>
          }
        </div>

        {/* Skills Card */}
        <div className="cc-card">
          <div className="profile-sec-label">
            <i className="fa-solid fa-star"></i>
            Skills
          </div>
          {user.skills?.length > 0
            ? <div className="profile-skills-wrap">
                {user.skills.map((skill, i) => (
                  <span key={i} className="profile-skill-badge">{skill}</span>
                ))}
              </div>
            : <p className="profile-empty">No skills added yet</p>
          }
        </div>

        {/* Links Card */}
        <div className="cc-card">
          <div className="profile-sec-label">
            <i className="fa-solid fa-link"></i>
            Links
          </div>
          {user.linkedIn
            ? <a href={user.linkedIn} target="_blank" rel="noreferrer" className="profile-link">
                <i className="fa-brands fa-linkedin"></i>
                LinkedIn Profile
              </a>
            : <p className="profile-empty" style={{ marginBottom: 8 }}>No LinkedIn added</p>
          }
          {user.github
            ? <a href={user.github} target="_blank" rel="noreferrer" className="profile-link">
                <i className="fa-brands fa-github"></i>
                GitHub Profile
              </a>
            : <p className="profile-empty">No GitHub added</p>
          }
        </div>

        {/* Edit Button */}
        <button className="cc-btn-primary profile-edit-btn" onClick={() => navigate('/edit-profile')}>
          <i className="fa-solid fa-pen-to-square"></i>
          Edit Profile
        </button>

      </div>
      <Footer />
    </div>
  );
};

export default Profile;
