import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/theme.css';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      console.log('Full response:', res.data);   // ← check this in F12 console
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1>CampusConnect</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="cc-alert-error" style={{ marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="login-form-group">
            <label className="cc-label">Email</label>
            <div className="login-input-wrap">
              <i className="fa-solid fa-envelope"></i>
              <input
                className="cc-input"
                type="email"
                name="email"
                placeholder="you@college.edu"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="cc-label">Password</label>
            <div className="login-input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                className="cc-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="cc-btn-primary login-submit"
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>
              : <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
            }
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;