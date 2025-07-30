import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveApprovalDashboard from './LeaveApprovalDashboard';

export default function LeaveApprovalDashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('leaveApprovalUser');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate('/leave-approval-login');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200 py-10">
      <LeaveApprovalDashboard user={user} approverId={user.id} />
    </div>
  );
} 