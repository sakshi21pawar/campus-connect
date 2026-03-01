import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', branch: '', year: '', bio: '', skills: '', linkedIn: '', github: ''
  });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/users/profile').then(res => {
      const u = res.data;
      setForm({
        name:     u.name       || '',
        branch:   u.branch     || '',
        year:     u.year       ? String(u.year) : '',
        bio:      u.bio        || '',
        skills:   u.skills     ? u.skills.join(', ') : '',
        linkedIn: u.linkedIn   || '',
        github:   u.github     || '',
      });
    }).catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      await axiosInstance.put('/users/profile', {
        ...form,
        year: Number(form.year),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <Navbar />

      <div className="edit-profile-body">
        <div className="cc-card">

          <div className="edit-profile-title">
            <i className="fa-solid fa-pen-to-square"></i>
            Edit Profile
          </div>
          <div className="edit-profile-sub">Keep your profile up to date to get noticed</div>

          {success && <div className="cc-alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check"></i>{success}</div>}
          {error   && <div className="cc-alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="form-group">
              <label className="cc-label">
                <i className="fa-solid fa-user" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Full Name
              </label>
              <input className="cc-input" name="name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            {/* Branch + Year */}
            <div className="form-row">
              <div className="form-group">
                <label className="cc-label">
                  <i className="fa-solid fa-code-branch" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                  Branch
                </label>
                <select className="cc-select" name="branch" value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })} required>
                  <option value="">Select branch</option>
                  <option>CS</option><option>IT</option><option>ENTC</option>
                  <option>Mechanical</option><option>Civil</option><option>Electrical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="cc-label">
                  <i className="fa-solid fa-calendar" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                  Year
                </label>
                <select className="cc-select" name="year" value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })} required>
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="cc-label">
                <i className="fa-solid fa-align-left" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Bio
              </label>
              <textarea className="cc-textarea" rows={3} name="bio" value={form.bio}
                placeholder="Tell others about yourself..."
                onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="cc-label">
                <i className="fa-solid fa-star" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Skills
                <span style={{ fontWeight: 400, color: 'var(--gray-mid)', fontSize: 12, marginLeft: 6 }}>(comma separated)</span>
              </label>
              <input className="cc-input" name="skills" value={form.skills}
                placeholder="React, Node.js, Python, DSA"
                onChange={e => setForm({ ...form, skills: e.target.value })} />
              {form.skills && (
                <div className="skill-tags">
                  {form.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* LinkedIn */}
            <div className="form-group">
              <label className="cc-label">
                <i className="fa-brands fa-linkedin" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                LinkedIn URL
              </label>
              <div className="input-with-icon">
                <i className="fa-solid fa-link"></i>
                <input className="cc-input" name="linkedIn" value={form.linkedIn}
                  placeholder="https://linkedin.com/in/yourname"
                  onChange={e => setForm({ ...form, linkedIn: e.target.value })} />
              </div>
            </div>

            {/* GitHub */}
            <div className="form-group">
              <label className="cc-label">
                <i className="fa-brands fa-github" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                GitHub URL
              </label>
              <div className="input-with-icon">
                <i className="fa-solid fa-link"></i>
                <input className="cc-input" name="github" value={form.github}
                  placeholder="https://github.com/yourname"
                  onChange={e => setForm({ ...form, github: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="cc-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                : <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
              }
            </button>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;
