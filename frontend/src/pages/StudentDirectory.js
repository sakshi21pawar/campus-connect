import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/Students.css';

const StudentDirectory = () => {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('browse');
  const [students,     setStudents]     = useState([]);
  const [requests,     setRequests]     = useState([]);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [filters,      setFilters]      = useState({ search: '', branch: '', year: '' });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/users/profile');
      setCurrentUser(res.data);
      return res.data;
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.branch) params.branch = filters.branch;
    if (filters.year)   params.year   = filters.year;
    axiosInstance.get('/users', { params })
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);

  useEffect(() => {
    if (!currentUser?.receivedRequests?.length) { setRequests([]); return; }
    Promise.all(currentUser.receivedRequests.map(id => axiosInstance.get(`/users/${id}`)))
      .then(results => setRequests(results.map(r => r.data)))
      .catch(console.error);
  }, [currentUser]);

  const getStatus = id => {
    if (!currentUser) return 'none';
    if (currentUser.connections?.includes(id))      return 'connected';
    if (currentUser.sentRequests?.includes(id))     return 'pending';
    if (currentUser.receivedRequests?.includes(id)) return 'incoming';
    return 'none';
  };

  const handleConnect = async id => {
    await axiosInstance.post(`/users/request/${id}`);
    setCurrentUser(prev => ({ ...prev, sentRequests: [...(prev.sentRequests || []), id] }));
  };

  const handleCancel = async id => {
    await axiosInstance.post(`/users/cancel/${id}`);
    setCurrentUser(prev => ({ ...prev, sentRequests: prev.sentRequests.filter(x => x !== id) }));
  };

  const handleAccept = async id => {
    await axiosInstance.post(`/users/accept/${id}`);
    await fetchCurrentUser();
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const handleReject = async id => {
    await axiosInstance.post(`/users/reject/${id}`);
    await fetchCurrentUser();
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const ActionButton = ({ student }) => {
    const status = getStatus(student._id);
    if (status === 'connected') return (
      <button className="btn-message" onClick={() => navigate(`/chat/${student._id}`)}>
        <i className="fa-solid fa-message"></i> Message
      </button>
    );
    if (status === 'pending') return (
      <button className="btn-pending" onClick={() => handleCancel(student._id)}>
        <i className="fa-solid fa-clock"></i> Pending
      </button>
    );
    if (status === 'incoming') return (
      <button className="btn-incoming">
        <i className="fa-solid fa-bell"></i> Wants to connect
      </button>
    );
    return (
      <button className="btn-connect" onClick={() => handleConnect(student._id)}>
        <i className="fa-solid fa-user-plus"></i> Connect
      </button>
    );
  };

  const StudentCard = ({ student, showAcceptReject = false }) => (
    <div className="student-card">
      {student.profilePic
        ? <img src={student.profilePic} alt={student.name} className="student-card-avatar" />
        : <div className="student-card-avatar-letter">{student.name.charAt(0).toUpperCase()}</div>
      }
      <div className="student-card-name">{student.name}</div>
      <div className="student-card-meta">
        <i className="fa-solid fa-code-branch"></i>
        {student.branch} &nbsp;•&nbsp; Year {student.year}
      </div>
      {student.skills?.length > 0 && (
        <div className="student-skills-row">
          {student.skills.slice(0, 3).map((s, i) => <span key={i} className="student-skill">{s}</span>)}
          {student.skills.length > 3 && <span className="student-skill">+{student.skills.length - 3}</span>}
        </div>
      )}
      <div className="student-btn-row">
        <button className="btn-view" onClick={() => navigate(`/students/${student._id}`)}>
          <i className="fa-solid fa-eye"></i> View
        </button>
        {showAcceptReject ? (
          <>
            <button className="btn-accept" onClick={() => handleAccept(student._id)}>
              <i className="fa-solid fa-check"></i> Accept
            </button>
            <button className="btn-reject" onClick={() => handleReject(student._id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </>
        ) : (
          <ActionButton student={student} />
        )}
      </div>
    </div>
  );

  return (
    <div className="students-page">
      <Navbar />

      <div className="students-body">

        {/* Tabs */}
        <div className="students-tabs">
          <button className={`students-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
            <i className="fa-solid fa-users"></i>
            Browse Students
          </button>
          <button className={`students-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <i className="fa-solid fa-user-clock"></i>
            Requests
            {requests.length > 0 && <span className="tab-badge">{requests.length}</span>}
          </button>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            <div className="students-filters">
              <div className="students-search-wrap">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input className="cc-input" placeholder="Search by name..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })} />
              </div>
              <select className="cc-select" onChange={e => setFilters({ ...filters, branch: e.target.value })}>
                <option value="">All Branches</option>
                <option value="CS">CS</option>
                <option value="IT">IT</option>
                <option value="ENTC">ENTC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
              <select className="cc-select" onChange={e => setFilters({ ...filters, year: e.target.value })}>
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {loading ? (
              <div className="cc-loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading students...</div>
            ) : students.length === 0 ? (
              <div className="cc-empty"><i className="fa-solid fa-users-slash"></i> No students found</div>
            ) : (
              <div className="students-grid">
                {students.map(s => <StudentCard key={s._id} student={s} />)}
              </div>
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          requests.length === 0 ? (
            <div className="cc-empty">
              <i className="fa-solid fa-inbox"></i>
              No pending connection requests
            </div>
          ) : (
            <div className="students-grid">
              {requests.map(s => <StudentCard key={s._id} student={s} showAcceptReject />)}
            </div>
          )
        )}

      </div>
      <Footer />
    </div>
  );
};

export default StudentDirectory;
