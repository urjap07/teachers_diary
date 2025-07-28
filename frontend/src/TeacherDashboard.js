import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryLogTable from './DiaryLogTable';
import DiarySummary from './DiarySummary';
import * as XLSX from 'xlsx';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'log', label: 'My Diary Log' }
];

function ExportExcelModal({ onClose, onExport }) {
  const [option, setOption] = useState('topic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const currentYear = new Date().getFullYear();
  return (
    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-40 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center min-h-[40vh]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Export to Excel</h2>
        <div className="mb-6 w-full">
          <label className="block text-gray-800 mb-2 font-semibold">Export Option</label>
          <select
            value={option}
            onChange={e => setOption(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner"
          >
            <option value="topic">Topic-wise</option>
            <option value="course">Course-wise</option>
            <option value="semester">Semester-wise</option>
            <option value="date-range">Date Range</option>
            <option value="month-wise">Month-wise</option>
          </select>
        </div>
        {option === 'date-range' && (
          <div className="mb-6 w-full flex gap-2">
            <div className="flex-1">
              <label className="block text-gray-800 mb-2 font-semibold">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex-1">
              <label className="block text-gray-800 mb-2 font-semibold">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
        )}
        {option === 'month-wise' && (
          <div className="mb-6 w-full flex gap-2">
            <div className="flex-1">
              <label className="block text-gray-800 mb-2 font-semibold">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-800 mb-2 font-semibold">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select</option>
                {[...Array(5)].map((_, i) => (
                  <option key={currentYear-i} value={currentYear-i}>{currentYear-i}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button
          onClick={() => onExport(option, { startDate, endDate, month, year })}
          className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition"
        >Export</button>
      </div>
    </div>
  );
}

export default function TeacherDashboard({ userId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showLeaveBalances, setShowLeaveBalances] = useState(false);
  useEffect(() => {
    fetch(`http://localhost:5000/api/leave-balances?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setLeaveBalances(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/leave-types')
      .then(res => res.json())
      .then(data => setLeaveTypes(Array.isArray(data) ? data : []));
  }, [userId]);
  const mergedBalances = leaveTypes
    .filter(type => [
      'Casual Leave (CL)',
      'Sick Leave (SL)',
      'Earned Leave (EL)',
      'Leave Without Pay (LWP)',
      'Maternity Leave (ML)'
    ].includes(type.name))
    .map(type => {
      const bal = leaveBalances.find(b => b.leave_type_id === type.leave_type_id);
      let available = '-';
      let opening_balance = '-';
      let used = '-';
      let adjustments = '-';
      if (bal) {
        opening_balance = bal.opening_balance;
        used = bal.used;
        adjustments = bal.adjustments;
        const usedNum = parseFloat(bal.used) || 0;
        const adjNum = parseFloat(bal.adjustments) || 0;
        const usedFalsy = !bal.used || bal.used === '0' || bal.used === '0.00';
        const adjFalsy = !bal.adjustments || bal.adjustments === '0' || bal.adjustments === '0.00';
        if (
          (type.name === 'Leave Without Pay (LWP)' || type.name === 'Maternity Leave (ML)') &&
          (usedFalsy && adjFalsy)
        ) {
          available = bal.opening_balance;
        } else {
          available = (parseFloat(bal.opening_balance) - usedNum + adjNum).toFixed(2);
        }
      } else if (type.name === 'Leave Without Pay (LWP)') {
        opening_balance = 999;
        available = 999;
      } else if (type.name === 'Maternity Leave (ML)') {
        opening_balance = 90;
        available = 90;
      }
      return {
        leave_type_name: type.name,
        opening_balance,
        used,
        adjustments,
        available,
      };
    });

  // Fetch all diary entries for this teacher
  const [allEntries, setAllEntries] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/diary-entries?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setAllEntries(Array.isArray(data) ? data : []));
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || '';

  const handleExport = async (option, extra = {}) => {
    if (option === 'date-range' || option === 'month-wise') {
      // Backend export
      let url = 'http://localhost:5000/api/export-excel?type=' + option + '&user_id=' + userId;
      if (option === 'date-range') {
        url += `&startDate=${extra.startDate}&endDate=${extra.endDate}`;
      } else if (option === 'month-wise') {
        url += `&month=${extra.month}&year=${extra.year}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        alert('Failed to export Excel');
        return;
      }
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'diary_entries.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportModal(false);
      return;
    }
    let data = [];
    if (option === 'topic') {
      data = allEntries.map(e => ({
        Date: e.date,
        Course: e.course_name,
        Semester: e.semester,
        Subject: e.subject,
        Topic: e.topic_covered,
        'Lecture No.': e.lecture_number,
        'Start Time': e.start_time,
        'End Time': e.end_time,
        Remarks: e.remarks
      }));
    } else if (option === 'course') {
      data = allEntries.map(e => ({
        Course: e.course_name,
        Date: e.date,
        Semester: e.semester,
        Subject: e.subject,
        Topic: e.topic_covered,
        'Lecture No.': e.lecture_number,
        'Start Time': e.start_time,
        'End Time': e.end_time,
        Remarks: e.remarks
      }));
    } else if (option === 'semester') {
      data = allEntries.map(e => ({
        Semester: e.semester,
        Course: e.course_name,
        Date: e.date,
        Subject: e.subject,
        Topic: e.topic_covered,
        'Lecture No.': e.lecture_number,
        'Start Time': e.start_time,
        'End Time': e.end_time,
        Remarks: e.remarks
      }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diary Entries');
    XLSX.writeFile(wb, `diary_entries_${option}_wise.xlsx`);
    setShowExportModal(false);
  };

  // const handleExportLeaveBalances = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('Leave Balances');
  //   sheet.addRow(['Type', 'Opening', 'Used', 'Adjustments', 'Available']);
  //   mergedBalances.forEach(b => {
  //     sheet.addRow([
  //       b.leave_type_name,
  //       b.opening_balance,
  //       b.used,
  //       b.adjustments,
  //       b.available
  //     ]);
  //   });
  //   const buf = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `Leave-Balances.xlsx`;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

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
        {/* Insert Leave Balances button above stat cards */}
        {activeTab === 'summary' && (
          <div className="w-full flex justify-start mb-4">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => setShowLeaveBalances(v => !v)}
            >
              Leave Balances
            </button>
          </div>
        )}
        {showLeaveBalances && (
          <div className="w-full mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow relative">
              {/* Remove the Export to Excel button from the leave balances table */}
              <h3 className="font-semibold text-blue-700 mb-2">Your Leave Balances ({new Date().getFullYear()})</h3>
              <table className="min-w-full divide-y divide-gray-200 mb-2">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Opening</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Used</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Adjustments</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Available</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {mergedBalances.map((b, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-semibold text-blue-800">{b.leave_type_name}</td>
                      <td className="px-4 py-2">{b.opening_balance}</td>
                      <td className="px-4 py-2">{b.used}</td>
                      <td className="px-4 py-2">{b.adjustments}</td>
                      <td className="px-4 py-2 font-bold text-green-700">{b.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="w-full backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg rounded-2xl p-6" style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}>
          {activeTab === 'log' && (
            <DiaryLogTable userId={userId} />
          )}
          {activeTab === 'summary' && (
            <DiarySummary userId={userId} />
          )}
        </div>
        {/* Export to Excel button at the bottom */}
        <div className="w-full flex justify-end items-center mt-10 mb-4 gap-4">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-2 rounded-xl border border-white/30 bg-blue-600/80 text-white font-semibold shadow-lg backdrop-blur-xl hover:bg-blue-700/90 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', fontWeight: 700, fontSize: '1rem'}}>
            Export to Excel
          </button>
        </div>
        {showExportModal && (
          <ExportExcelModal onClose={() => setShowExportModal(false)} onExport={handleExport} />
        )}
      </div>
    </div>
  );
}
