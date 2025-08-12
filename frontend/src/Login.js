import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'identifier') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  const validate = () => {
    const errs = {};
    if (!email) errs.identifier = 'Email or Mobile is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setLoginError("");
    if (Object.keys(errs).length === 0) {
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          onLoginSuccess && onLoginSuccess(data); // This sets the user in App.js
          localStorage.setItem('user', JSON.stringify(data)); // Persist user
          console.log('Logged in user:', data);
          if (data.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/diary-entry');
          }
        } else {
          setLoginError(data.message || 'Login failed');
        }
      } catch (err) {
        setLoginError('Server error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center drop-shadow">Login</h1>
        {loginError && (
          <div className="w-full mb-6 bg-red-500/90 text-white text-center px-4 py-3 rounded-lg shadow font-semibold animate-fade-in">
            {loginError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Email or Mobile</label>
            <input
              type="text"
              name="identifier"
              value={email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.identifier ? 'ring-2 ring-red-400' : ''}`}
              placeholder="Enter your email or mobile number"
            />
            {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleChange}
                className={`w-full px-4 pr-12 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Enter your password"
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600/80 text-white py-3 rounded-lg hover:bg-blue-700/90 transition font-bold shadow-lg backdrop-blur-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 