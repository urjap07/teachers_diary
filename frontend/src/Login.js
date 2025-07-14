import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
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
    if (Object.keys(errs).length === 0) {
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          onLoginSuccess && onLoginSuccess(data.user); // This sets the user in App.js
          localStorage.setItem('user', JSON.stringify(data.user)); // Persist user
          console.log('Logged in user:', data.user);
          if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/diary-entry');
          }
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        alert('Server error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center drop-shadow">Login</h1>
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
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.password ? 'ring-2 ring-red-400' : ''}`}
              placeholder="Enter your password"
            />
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