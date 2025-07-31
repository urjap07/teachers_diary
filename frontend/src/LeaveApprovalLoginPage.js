import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveApprovalLoginModal from './LeaveApprovalLoginModal';

export default function LeaveApprovalLoginPage() {
  console.log('LeaveApprovalLoginPage component rendered');
  const navigate = useNavigate();

  const handleLogin = (userObj) => {
    console.log('Login successful, navigating to dashboard');
    sessionStorage.setItem('leaveApprovalUser', JSON.stringify(userObj));
    navigate('/leave-approval-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Leave Approval Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the leave approval dashboard
          </p>
        </div>
        <LeaveApprovalLoginModal onClose={() => {}} onLogin={handleLogin} />
      </div>
    </div>
  );
} 