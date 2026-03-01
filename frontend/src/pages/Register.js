import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/theme.css';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', branch: '', year: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">

        <div className="register-brand">
          <div className="register-brand-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1>CampusConnect</h1>
          <p>Create your student account</p>
        </div>

        {error && (
          <div className="cc-alert-error" style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="register-form-group">
            <label className="cc-label">Full Name</label>
            <div className="register-input-wrap">
              <i className="fa-solid fa-user"></i>
              <input className="cc-input" type="text" name="name"
                placeholder="John Doe" onChange={handleChange} required />
            </div>
          </div>

          <div className="register-form-group">
            <label className="cc-label">Email</label>
            <div className="register-input-wrap">
              <i className="fa-solid fa-envelope"></i>
              <input className="cc-input" type="email" name="email"
                placeholder="you@college.edu" onChange={handleChange} required />
            </div>
          </div>

          <div className="register-form-group">
            <label className="cc-label">Password</label>
            <div className="register-input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input className="cc-input" type="password" name="password"
                placeholder="Create a password" onChange={handleChange} required />
            </div>
          </div>

          <div className="register-row">
            <div>
              <label className="cc-label">
                <i className="fa-solid fa-code-branch" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Branch
              </label>
              <select className="cc-select" name="branch" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="CS">CS</option>
                <option value="IT">IT</option>
                <option value="ENTC">ENTC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div>
              <label className="cc-label">
                <i className="fa-solid fa-calendar" style={{ marginRight: 6, color: 'var(--primary-light)' }}></i>
                Year
              </label>
              <select className="cc-select" name="year" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <button type="submit" className="cc-btn-primary register-submit" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating account...</>
              : <><i className="fa-solid fa-user-plus"></i> Create Account</>
            }
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;