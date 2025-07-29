import React, { useState } from 'react';

export default function LeaveApprovalLoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Replace this with your real authentication logic!
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (
        res.ok && (data.is_hod || data.is_principal || data.role === 'admin' || data.role === 'teacher')
      ) {
        onLogin(data); // Pass the user object up
      } else {
        setError('Invalid credentials or not authorized');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Leave Approval Login</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner"
              required
            />
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 