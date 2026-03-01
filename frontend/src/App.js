import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ResourceHub      from './pages/ResourceHub';
import UploadResource   from './pages/UploadResource';
import StudentDirectory from './pages/StudentDirectory';
import StudentProfile   from './pages/StudentProfile';
import Clubs      from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import CreateClub from './pages/CreateClub';
import AIAssistant from "./pages/AIAssistant";
import Chat from './pages/Chat';



// ✅ If no token found, redirect to login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />
        <Route path="/resources"        element={<ProtectedRoute><ResourceHub /></ProtectedRoute>} />
<Route path="/upload-resource"  element={<ProtectedRoute><UploadResource /></ProtectedRoute>} />
<Route path="/students"     element={<ProtectedRoute><StudentDirectory /></ProtectedRoute>} />
<Route path="/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
<Route path="/clubs"        element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
<Route path="/clubs/create" element={<ProtectedRoute><CreateClub /></ProtectedRoute>} />
<Route path="/clubs/:id"    element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />
<Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
<Route path="/chat" element={<Chat />} />
<Route path="/chat/:userId" element={<Chat />} />

      </Routes>
    </Router>
  );
}

export default App;