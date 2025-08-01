import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import DiaryEntryForm from './DiaryEntryForm';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import AdminManagementPanel from './AdminManagementPanel';
import LeaveApprovalLoginPage from './LeaveApprovalLoginPage';
import LeaveApprovalDashboardPage from './LeaveApprovalDashboardPage';

function App() {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user'); // Clear invalid data
      return null;
    }
  });
  console.log('App user:', user);

  // Helper to keep localStorage in sync
  const setUser = (u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={setUser} />}
        />
        <Route
          path="/diary-entry"
          element={
            user
              ? <DiaryEntryForm userId={user.id} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={
            user
              ? <TeacherDashboard userId={user.id} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            // Replace this check with your actual admin authentication logic
            user && user.role === 'admin'
              ? <AdminDashboard />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin-management"
          element={
            user && user.role === 'admin'
              ? <AdminManagementPanel />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/leave-approval-login"
          element={<LeaveApprovalLoginPage />}
        />
        <Route
          path="/leave-approval-dashboard"
          element={<LeaveApprovalDashboardPage />}
        />
        <Route
          path="/"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/diary-entry'} />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;