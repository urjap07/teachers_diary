import React, { useState } from 'react';

export default function LeaveApprovalLoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Replace this with your real authentication logic!
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password }),
      });
      const data = await res.json();
      if (
        res.ok && (data && ((data.is_principal === 1 || data.is_principal === true) || data.role === 'admin' || data.is_hod === true))
      ) {
        onLogin(data); // Pass the user object up
      } else {
        setError('Invalid credentials or not authorized for leave approval');
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 pr-12 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 4c4.77 0 8 4.2 8 6s-3.23 6-8 6-8-4.2-8-6 3.23-6 8-6zm0 2C6.86 6 4.42 8.33 3.53 10 4.42 11.67 6.86 14 10 14s5.58-2.33 6.47-4C15.58 8.33 13.14 6 10 6zm0 2a2 2 0 110 4 2 2 0 010-4z" />
                    <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 4c4.77 0 8 4.2 8 6s-3.23 6-8 6-8-4.2-8-6 3.23-6 8-6zm0 2C6.86 6 4.42 8.33 3.53 10 4.42 11.67 6.86 14 10 14s5.58-2.33 6.47-4C15.58 8.33 13.14 6 10 6zm0 2a2 2 0 110 4 2 2 0 010-4z" />
                  </svg>
                )}
              </button>
            </div>
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