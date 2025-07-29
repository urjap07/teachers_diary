import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveApprovalLoginModal from './LeaveApprovalLoginModal';

export default function LeaveApprovalLoginPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userObj) => {
    setUser(userObj);
    sessionStorage.setItem('leaveApprovalUser', JSON.stringify(userObj));
    navigate('/leave-approval-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="w-full max-w-md mx-auto">
        <LeaveApprovalLoginModal onClose={() => navigate('/')} onLogin={handleLogin} />
      </div>
    </div>
  );
} 