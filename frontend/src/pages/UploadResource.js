import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Resources.css';

const UploadResource = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', type: 'notes',
    branch: '', year: '', subject: '', videoUrl: ''
  });
  const [file,    setFile]    = useState(null);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (file) formData.append('file', file);
      await axiosInstance.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Resource uploaded successfully!');
      setTimeout(() => navigate('/resources'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <Navbar />

      <div className="upload-body">
        <div className="cc-card">
          <div className="upload-title">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Upload Resource
          </div>
          <div className="upload-sub">Share notes, question papers, or video links with your peers</div>

          {success && <div className="cc-alert-success" style={{ marginBottom: 18 }}><i className="fa-solid fa-circle-check"></i>{success}</div>}
          {error   && <div className="cc-alert-error"   style={{ marginBottom: 18 }}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="upload-form-group">
              <label className="cc-label">Title</label>
              <input name="title" className="cc-input" placeholder="e.g. DBMS Unit 3 Notes" onChange={handleChange} required />
            </div>

            <div className="upload-form-group">
              <label className="cc-label">Description</label>
              <textarea name="description" className="cc-textarea" rows={3} placeholder="Short description..." onChange={handleChange} />
            </div>

            <div className="upload-form-group">
              <label className="cc-label">Resource Type</label>
              <select name="type" className="cc-select" onChange={handleChange} value={form.type}>
                <option value="notes">Notes (PDF)</option>
                <option value="question_paper">Question Paper (PDF)</option>
                <option value="assignment">Assignment</option>
                <option value="video_link">Video Link (YouTube)</option>
              </select>
            </div>

            <div className="upload-form-row">
              <div>
                <label className="cc-label">Branch</label>
                <select name="branch" className="cc-select" onChange={handleChange} required>
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
                <label className="cc-label">Year</label>
                <select name="year" className="cc-select" onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="upload-form-group">
              <label className="cc-label">Subject</label>
              <input name="subject" className="cc-input" placeholder="e.g. DBMS, OS, CN" onChange={handleChange} required />
            </div>

            {form.type === 'video_link' ? (
              <div className="upload-form-group">
                <label className="cc-label">
                  <i className="fa-brands fa-youtube" style={{ marginRight: 6, color: '#DC2626' }}></i>
                  YouTube URL
                </label>
                <input name="videoUrl" className="cc-input" placeholder="https://youtube.com/watch?v=..." onChange={handleChange} />
              </div>
            ) : (
              <div className="upload-form-group">
                <label className="cc-label">Upload File (PDF / DOC)</label>
                <div className="file-drop-zone" onClick={() => document.getElementById('fileInput').click()}>
                  <i className="fa-solid fa-file-arrow-up"></i>
                  <p>{file ? file.name : 'Click to choose a file'}</p>
                  <span>PDF, DOC, DOCX supported</span>
                  <input id="fileInput" type="file" accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>
            )}

            <button type="submit" className="cc-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</>
                : <><i className="fa-solid fa-cloud-arrow-up"></i> Upload Resource</>
              }
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UploadResource;