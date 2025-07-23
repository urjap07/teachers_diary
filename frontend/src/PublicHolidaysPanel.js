import React, { useState, useEffect } from 'react';

export default function PublicHolidaysPanel() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', name: '' });
  const [msg, setMsg] = useState('');

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/holidays');
      const data = await res.json();
      setHolidays(data);
      setError('');
    } catch (e) {
      setError('Failed to fetch holidays');
    }
    setLoading(false);
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleAdd = async () => {
    if (!form.date || !form.name) return setMsg('Date and name required');
    setMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setMsg('Holiday added successfully!');
        setTimeout(() => setMsg(''), 1500);
        setShowAdd(false);
        setForm({ date: '', name: '' });
        fetchHolidays();
      } else {
        const text = await res.text();
        setMsg('Server error: ' + text);
      }
    } catch {
      setMsg('Failed to add holiday');
    }
  };

  const handleEdit = async () => {
    if (!form.date || !form.name) return setMsg('Date and name required');
    setMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/holidays/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setMsg('Holiday updated successfully!');
        setTimeout(() => setMsg(''), 1500);
        setShowEdit(false);
        setForm({ date: '', name: '' });
        setSelected(null);
        fetchHolidays();
      } else {
        const text = await res.text();
        setMsg('Server error: ' + text);
      }
    } catch {
      setMsg('Failed to edit holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    setMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/holidays/${id}`, { method: 'DELETE' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setMsg('Holiday deleted successfully!');
        setTimeout(() => setMsg(''), 1500);
        fetchHolidays();
      } else {
        const text = await res.text();
        setMsg('Server error: ' + text);
      }
    } catch {
      setMsg('Failed to delete holiday');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Public Holidays</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { setShowAdd(true); setForm({ date: '', name: '' }); setMsg(''); }}>Add Holiday</button>
      </div>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Date</th>
              <th className="p-2">Name</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map(h => (
              <tr key={h.id} className="border-t">
                <td className="p-2">{h.date}</td>
                <td className="p-2">{h.name}</td>
                <td className="p-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700 transition mr-2"
                    onClick={() => { setShowEdit(true); setSelected(h); setForm({ date: h.date.slice(0, 10), name: h.name }); setMsg(''); }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700 transition"
                    onClick={() => handleDelete(h.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-80">
            <h3 className="font-bold mb-2">Add Holiday</h3>
            <input type="date" className="w-full mb-2 p-2 border rounded" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Holiday Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {msg && (
              <div className={msg.includes('successfully') ? 'text-green-600 font-semibold mb-2' : 'text-red-500 text-sm mb-2'}>{msg}</div>
            )}
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-80">
            <h3 className="font-bold mb-2">Edit Holiday</h3>
            <input type="date" className="w-full mb-2 p-2 border rounded" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Holiday Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {msg && (
              <div className={msg.includes('successfully') ? 'text-green-600 font-semibold mb-2' : 'text-red-500 text-sm mb-2'}>{msg}</div>
            )}
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}