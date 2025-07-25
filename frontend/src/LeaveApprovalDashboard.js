import React, { useEffect, useState } from 'react';

function ActionModal({ open, action, onClose, onConfirm, leave, loading }) {
  const [remarks, setRemarks] = useState('');
  useEffect(() => { setRemarks(''); }, [open, leave]);
  if (!open || !leave) return null;
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">{actionLabel} Leave Request</h2>
        <div className="mb-4 w-full">
          <label className="block text-gray-800 mb-2 font-semibold">Remarks</label>
          <textarea
            className="w-full px-4 py-2 rounded border"
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Enter remarks (optional)"
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => onConfirm(remarks)}
            className={`px-6 py-2 rounded-xl border font-semibold shadow ${action === 'approve' ? 'bg-green-500 text-white hover:bg-green-700 border-green-500' : action === 'reject' ? 'bg-red-500 text-white hover:bg-red-700 border-red-500' : 'bg-yellow-500 text-white hover:bg-yellow-700 border-yellow-500'}`}
            disabled={loading}
          >{loading ? 'Processing...' : actionLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function LeaveApprovalDashboard() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [modal, setModal] = useState({ open: false, action: '', leave: null });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/api/leaves?ts=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched leaves:', data);
        data.forEach(l => {
          console.log(`Leave id: ${l.id}, status: ${l.status}`);
        });
        setRequests(Array.isArray(data) ? data : []);
      });
    fetch('http://localhost:5000/api/leave-types')
      .then(res => res.json())
      .then(data => setLeaveTypes(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(u => { map[u.id] = u.name; });
          setUserMap(map);
        }
      });
  }, [refresh]);

  const handleAction = (leave, action) => {
    setModal({ open: true, action, leave });
  };

  const handleConfirm = async (remarks) => {
    if (!modal.leave) return;
    setLoading(true);
    const leaveId = modal.leave.leave_id || modal.leave.id;
    let url = `http://localhost:5000/api/leave-requests/${leaveId}/${modal.action}`;
    let method = 'PUT';
    let body = { approver_id: 2, remarks }; // TODO: use real approver_id
    if (modal.action === 'escalate') {
      body = { new_approver_id: 2, remarks }; // TODO: pick next authority
    }
    // Toggle logic: if already in target status, set to pending
    const currentStatus = modal.leave.status;
    if (
      (modal.action === 'approve' && currentStatus === 'approved') ||
      (modal.action === 'reject' && currentStatus === 'rejected') ||
      (modal.action === 'escalate' && currentStatus === 'escalated')
    ) {
      body.force_pending = true;
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setMsg(data.message || 'Action completed');
      setRefresh(r => r + 1); // trigger table refresh
    } catch (err) {
      setMsg('Server error or network error');
    }
    setLoading(false);
    setModal({ open: false, action: '', leave: null });
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">All Leave Records</h2>
      {msg && <div className="mb-4 text-green-700 font-semibold text-center">{msg}</div>}
      <div className="bg-white rounded-xl shadow p-10">
        <table className="w-full min-w-[900px] divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">Applicant</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">From</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">To</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">Comments</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No leave records</td>
              </tr>
            ) : (
              requests.map((req, idx) => (
                <tr key={req.leave_id || req.id} className={idx % 2 === 0 ? 'bg-blue-50 hover:bg-blue-100 transition' : 'hover:bg-blue-50 transition'}>
                  <td className="px-6 py-4 font-semibold text-blue-900">{userMap[req.user_id] || req.user_id}</td>
                  <td className="px-6 py-4 font-semibold text-purple-700">{req.reason || '-'}</td>
                  <td className="px-6 py-4">{(req.from_date || req.start_date)?.slice(0,10)}</td>
                  <td className="px-6 py-4">{(req.to_date || req.end_date)?.slice(0,10)}</td>
                  <td className="px-6 py-4">{req.remarks || req.comments || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      req.status === 'escalated' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status === 'escalated' ? 'escalated' : req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-nowrap justify-center gap-x-3">
                      <button className="px-2 py-1 rounded bg-green-500 text-white font-semibold hover:bg-green-700 text-sm" onClick={() => handleAction(req, 'approve')}>
                        Approve
                      </button>
                      <button className="px-2 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700 text-sm" onClick={() => handleAction(req, 'reject')}>
                        Reject
                      </button>
                      <button className="px-2 py-1 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-700 text-sm" onClick={() => handleAction(req, 'escalate')}>
                        Escalate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ActionModal
        open={modal.open}
        action={modal.action}
        onClose={() => setModal({ open: false, action: '', leave: null })}
        onConfirm={handleConfirm}
        leave={modal.leave}
        loading={loading}
      />
    </div>
  );
}
