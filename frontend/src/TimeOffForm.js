import React, { useState } from 'react';

export default function TimeOffForm({ userId, teacherName, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [days, setDays] = useState('1');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('http://localhost:5000/api/time-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, date, days, reason }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg('Time-off added!');
      setDate(today);
      setDays('1');
      setReason('');
      setTimeout(() => {
        setMsg('');
        if (onSuccess) onSuccess();
      }, 1200);
    } else {
      setMsg(data.message || 'Error adding time-off');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-8 flex flex-col gap-6 max-w-lg w-full" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)'}}>
      {teacherName && (
        <h4 className="text-xl font-bold text-blue-700 mb-2 text-center">{teacherName}</h4>
      )}
      <h4 className="text-2xl font-extrabold text-blue-800 mb-2 text-center drop-shadow">Add Time-Off</h4>
      <label>
        <span className="block text-gray-800 mb-2 font-semibold">Date</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
      </label>
      <label>
        <span className="block text-gray-800 mb-2 font-semibold">Number of Days</span>
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={days}
          onChange={e => setDays(e.target.value)}
          required
          className="w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner"
        />
      </label>
      <label>
        <span className="block text-gray-800 mb-2 font-semibold">Reason</span>
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
      </label>
      <button type="submit" disabled={loading} className="w-full bg-blue-600/80 text-white py-3 rounded-lg hover:bg-blue-700/90 transition font-bold shadow-lg backdrop-blur-md">
        {loading ? 'Saving...' : 'Add Time-Off'}
      </button>
      {msg && <div className="text-green-600 text-center mt-2 font-semibold">{msg}</div>}
    </form>
  );
} 