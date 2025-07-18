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
          </select>
        </div>
        <button
          onClick={() => onExport(option)}
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

  const handleExport = (option) => {
    let data = [];
    if (option === 'topic') {
      // Group by topic
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
      // Group by course
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
      // Group by semester
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
