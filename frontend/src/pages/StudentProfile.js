import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Students.css';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student,     setStudent]     = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/users/profile'),
      axiosInstance.get(`/users/${id}`),
    ]).then(([meRes, studentRes]) => {
      setCurrentUser(meRes.data);
      setStudent(studentRes.data);
    }).catch(() => navigate('/students'));
  }, [id, navigate]);

  const getStatus = () => {
    if (!currentUser) return 'none';
    if (currentUser.connections?.includes(id))  return 'connected';
    if (currentUser.sentRequests?.includes(id)) return 'pending';
    return 'none';
  };

  const handleConnect = async () => {
    await axiosInstance.post(`/users/request/${id}`);
    setCurrentUser(prev => ({ ...prev, sentRequests: [...prev.sentRequests, id] }));
  };

  const handleCancel = async () => {
    await axiosInstance.post(`/users/cancel/${id}`);
    setCurrentUser(prev => ({ ...prev, sentRequests: prev.sentRequests.filter(r => r !== id) }));
  };

  if (!student) return (
    <div className="cc-loading">
      <i className="fa-solid fa-spinner fa-spin"></i>
      Loading profile...
    </div>
  );

  const status = getStatus();

  return (
    <div className="students-page">
      <Navbar />

      <div className="student-profile-body">

        {/* Back */}
        <button className="cc-btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/students')}>
          <i className="fa-solid fa-arrow-left"></i>
          Back to Directory
        </button>

        {/* Info Card */}
        <div className="cc-card">
          <div className="sp-top-row">
            <div className="sp-avatar">
              {student.profilePic
                ? <img src={student.profilePic} alt={student.name} />
                : student.name.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div className="sp-name">{student.name}</div>
              <div className="sp-email">
                <i className="fa-solid fa-envelope"></i>
                {student.email}
              </div>
            </div>
          </div>

          <div className="profile-pill-row">
            <span className="profile-pill">
              <i className="fa-solid fa-code-branch"></i>
              {student.branch}
            </span>
            <span className="profile-pill">
              <i className="fa-solid fa-calendar"></i>
              Year {student.year}
            </span>
          </div>

          <div className="profile-sec-label">
            <i className="fa-solid fa-align-left"></i>
            Bio
          </div>
          {student.bio
            ? <p className="profile-bio-text">{student.bio}</p>
            : <p className="profile-empty">No bio added</p>
          }
        </div>

        {/* Skills */}
        <div className="cc-card">
          <div className="profile-sec-label">
            <i className="fa-solid fa-star"></i>
            Skills
          </div>
          {student.skills?.length > 0
            ? <div className="profile-skills-wrap">
                {student.skills.map((s, i) => <span key={i} className="profile-skill-badge">{s}</span>)}
              </div>
            : <p className="profile-empty">No skills added</p>
          }
        </div>

        {/* Links */}
        <div className="cc-card">
          <div className="profile-sec-label">
            <i className="fa-solid fa-link"></i>
            Links
          </div>
          {student.linkedIn
            ? <a href={student.linkedIn} target="_blank" rel="noreferrer" className="profile-link">
                <i className="fa-brands fa-linkedin"></i> LinkedIn Profile
              </a>
            : <p className="profile-empty" style={{ marginBottom: 8 }}>No LinkedIn added</p>
          }
          {student.github
            ? <a href={student.github} target="_blank" rel="noreferrer" className="profile-link">
                <i className="fa-brands fa-github"></i> GitHub Profile
              </a>
            : <p className="profile-empty">No GitHub added</p>
          }
        </div>

        {/* Action Button */}
        {status === 'connected' && (
          <button className="cc-btn-primary sp-action-btn" onClick={() => navigate(`/chat/${id}`)}>
            <i className="fa-solid fa-message"></i> Send Message
          </button>
        )}
        {status === 'pending' && (
          <button className="cc-btn-outline sp-action-btn" onClick={handleCancel}>
            <i className="fa-solid fa-clock"></i> Pending — Cancel Request
          </button>
        )}
        {status === 'none' && (
          <button className="cc-btn-primary sp-action-btn" onClick={handleConnect}>
            <i className="fa-solid fa-user-plus"></i> Connect
          </button>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default StudentProfile;
