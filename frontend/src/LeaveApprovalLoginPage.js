import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveApprovalLoginModal from './LeaveApprovalLoginModal';

export default function LeaveApprovalLoginPage() {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = sessionStorage.getItem('leaveApprovalUser');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj && (userObj.is_hod || userObj.is_principal || userObj.role === 'admin')) {
        navigate('/leave-approval-dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = (userObj) => {
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