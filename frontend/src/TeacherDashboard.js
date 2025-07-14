import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryLogTable from './DiaryLogTable';
import DiarySummary from './DiarySummary';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'log', label: 'My Diary Log' }
];

export default function TeacherDashboard({ userId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200 py-10">
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-4xl flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        {userName && (
          <div className="w-full flex justify-start items-center mb-2">
            <span className="text-lg font-semibold text-blue-800">Welcome, {userName}!</span>
          </div>
        )}
        <div className="flex items-center justify-between border-b-2 border-blue-200 mb-8 w-full">
          <div>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 font-semibold transition text-lg rounded-t-lg ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-800 bg-white/60 shadow'
                    : 'text-gray-500 hover:text-blue-600 bg-transparent'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-white/30 bg-white/20 text-red-600 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/40 hover:text-red-700 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(255, 0, 0, 0.10)'}}
          >
            Logout
          </button>
        </div>
        <div className="w-full backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg rounded-2xl p-6" style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}>
          {activeTab === 'log' && (
            <DiaryLogTable userId={userId} />
          )}
          {activeTab === 'summary' && (
            <DiarySummary userId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}
