import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
// import LeaveApprovalDashboard from './LeaveApprovalDashboard';

function calculateDuration(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl shadow-lg p-6 flex-1 text-center border border-white/40 transition hover:scale-105 hover:shadow-2xl">
      <div className="text-gray-500 text-sm font-semibold">{title}</div>
      <div className="text-3xl font-bold text-blue-800 mt-2 drop-shadow">{value}</div>
    </div>
  );
}

function AddTeacherModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!form.mobile) errs.mobile = 'Mobile is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-40 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center min-h-[60vh]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add Teacher</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Mobile</label>
            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Add Teacher</button>
        </form>
      </div>
    </div>
  );
}

function EditTeacherModal({ teacher, onClose, onSubmit, tableRef, containerRef, diaryLogRowRefs, diaryLogRowCount }) {
  const [form, setForm] = useState({ ...teacher, password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!form.mobile) errs.mobile = 'Mobile is required';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
    }
  };

  // Clamp modal inside container
  const [modalStyle, setModalStyle] = useState({});
  useEffect(() => {
    if (tableRef && tableRef.current && containerRef && containerRef.current && diaryLogRowRefs && diaryLogRowRefs.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const modalWidth = 500;
      const modalHeight = 520; // estimate or measure modal height
      let left = tableRef.current.getBoundingClientRect().left + tableRef.current.getBoundingClientRect().width / 2 - modalWidth / 2 + window.scrollX;
      // Clamp left so modal stays inside container
      const minLeft = containerRect.left + 16 + window.scrollX; // 16px padding
      const maxLeft = containerRect.right - modalWidth - 16 + window.scrollX; // 16px padding
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      // Position from 2nd last diary log row
      let top = undefined;
      if (diaryLogRowCount >= 2) {
        const row = diaryLogRowRefs.current[diaryLogRowCount - 2];
        if (row) {
          const rowRect = row.getBoundingClientRect();
          top = rowRect.bottom + 16 + window.scrollY;
        }
      }
      if (top === undefined) {
        // fallback to teachers table
        top = tableRef.current.getBoundingClientRect().bottom + 16 + window.scrollY;
      }
      // Clamp top so modal stays inside container
      const maxTop = containerRect.bottom - modalHeight - 16 + window.scrollY; // 16px padding
      if (top > maxTop) top = maxTop;
      setModalStyle({
        position: 'absolute',
        left,
        top,
        width: modalWidth,
        zIndex: 1000
      });
    }
  }, [tableRef, containerRef, diaryLogRowRefs, diaryLogRowCount]);

  return (
    <div style={modalStyle} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center border border-blue-200">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Edit Teacher</h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label className="block text-gray-800 mb-2 font-semibold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-800 mb-2 font-semibold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-800 mb-2 font-semibold">Mobile</label>
          <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
          {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-800 mb-2 font-semibold">Password (leave blank to keep unchanged)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-800 mb-2 font-semibold">Status</label>
          <select name="active" value={form.active} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Update Teacher</button>
      </form>
    </div>
  );
}

function ConfirmDeleteModal({ teacher, onClose, onConfirm, containerRef, teachersHeadingRef }) {
  const [modalStyle, setModalStyle] = useState({});
  useEffect(() => {
    if (containerRef && containerRef.current && teachersHeadingRef && teachersHeadingRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const headingRect = teachersHeadingRef.current.getBoundingClientRect();
      const modalWidth = 400;
      const modalHeight = 220;
      // Center horizontally in container
      let left = containerRect.left + (containerRect.width - modalWidth) / 2 + window.scrollX;
      // Place just above the Teachers heading
      let top = headingRect.top - modalHeight - 16 + window.scrollY;
      // Clamp left
      const minLeft = containerRect.left + 16 + window.scrollX;
      const maxLeft = containerRect.right - modalWidth - 16 + window.scrollX;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      // Clamp top
      const maxTop = containerRect.bottom - modalHeight - 16 + window.scrollY;
      if (top > maxTop) top = maxTop;
      setModalStyle({
        position: 'absolute',
        left,
        top,
        width: modalWidth,
        zIndex: 1000
      });
    }
  }, [containerRef, teachersHeadingRef]);
  return (
    <div style={modalStyle} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center border border-red-200">
      <h2 className="text-2xl font-bold text-red-700 mb-6">Delete Teacher</h2>
      <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-bold">{teacher.name}</span>?</p>
      <div className="flex gap-4">
        <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
        <button onClick={onConfirm} className="px-6 py-2 rounded-xl border border-red-500 bg-red-600 text-white font-semibold shadow hover:bg-red-700">Delete</button>
      </div>
    </div>
  );
}

// Add week calculation helper if not present
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// Add ExportExcelModal definition
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

// Helper: Get number of weeks in a month
export default function AdminDashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [leaves, setLeaves] = useState([]); // Use leaves instead of timeOff
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showCourseSummary, setShowCourseSummary] = useState(false); // NEW
  const [showTimeOffAnalytics, setShowTimeOffAnalytics] = useState(false); // NEW
  const [selectedCourseMonth, setSelectedCourseMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  // --- Dynamic Year and Month Dropdowns for Time-Off Analytics ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const earliestYear = 2020;
  const years = [];
  for (let y = currentYear; y >= earliestYear; y--) years.push(y);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  const [selectedTimeOffYear, setSelectedTimeOffYear] = useState(currentYear);
  const [selectedTimeOffMonth, setSelectedTimeOffMonth] = useState(String(currentMonth).padStart(2, '0'));
  const filteredMonths = months.filter(m => Number(selectedTimeOffYear) < currentYear || Number(m.value) <= currentMonth);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // NEW
  // Diary Log Table month filter state
  // Year, Month, and Week dropdowns for diary log
  // Remove year, month, and week dropdowns for diary log
  // Only keep startDate and endDate for filtering

  // Remove year/month filtering from filteredDiaryEntries
  const filteredDiaryEntries = entries.filter(e => {
    if (!e.date) return false;
    if (startDate && new Date(e.date) < new Date(startDate)) return false;
    if (endDate && new Date(e.date) > new Date(endDate)) return false;
    return true;
  });

  // Filter entries for selected week/year with debug logging
  useEffect(() => {
    // Debug: log all entry weeks/years
    if (entries && entries.length > 0) {
      console.log('--- Diary Entry Weeks/Years ---');
      entries.forEach(e => {
        if (e.date) {
          const d = new Date(e.date);
          const week = getWeekNumber(d);
          const year = d.getFullYear();
          console.log(`Entry:`, e, 'Year:', year, 'Week:', week);
        }
      });
      console.log('Selected Year:', 'all', 'Selected Week:', 'all'); // Removed selectedDiaryWeek from log
    }
  }, [entries]); // Removed selectedDiaryWeek from dependency array

  const [showCourseCompletion, setShowCourseCompletion] = useState(false);
  const [courseCompletionData, setCourseCompletionData] = useState([]);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [showLecturesByTeacher, setShowLecturesByTeacher] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const teachersTableRef = useRef(null);
  const containerRef = useRef(null);
  const diaryLogRowRefs = useRef([]);
  const teachersHeadingRef = useRef(null);
  const [showExportModal, setShowExportModal] = useState(false);
  // const [showApprovalDashboard, setShowApprovalDashboard] = useState(false);

  useEffect(() => {
    let url = 'http://localhost:5000/api/diary-entries';
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setEntries(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/leaves')
      .then(res => res.json())
      .then(data => setLeaves(Array.isArray(data) ? data : []));
    fetchTeachers();
  }, [startDate, endDate]);

  const fetchTeachers = async () => {
  };

  const totalLectures = entries.length;
  // Move this up before totalTimeOff is used
  // Use the 'date' field for filtering leaves by selected year and month
  const filteredLeaves = leaves.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return y === Number(selectedTimeOffYear) && m === selectedTimeOffMonth;
  });
  // For the stat card:
  const totalTimeOff = filteredLeaves.reduce((sum, l) => sum + Number(l.days), 0);
  // Filter entries by selected month for course summary
  const filteredEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return ym === selectedCourseMonth;
  });
  const uniqueCourses = Array.from(new Set(filteredEntries.map(e => (e.course_name || '').trim())));
  const totalCoursesTaught = uniqueCourses.length;
  // Group entries by course for summary (filtered)
  const courseLectureCounts = uniqueCourses.map(course => ({
    name: course,
    count: filteredEntries.filter(e => (e.course_name || '').trim() === course).length
  }));
  // For expanded course: group by teacher, semester, subject, topic (filtered)
  let expandedRows = [];
  if (expandedCourse) {
    const filtered = filteredEntries.filter(e => (e.course_name || '').trim() === expandedCourse);
    // Group by teacher, semester, subject, topic
    const groupMap = {};
    filtered.forEach(e => {
      const key = `${e.teacher_name}|${e.semester}|${e.subject}|${e.topic_covered}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          teacher: e.teacher_name,
          teacher_name: e.teacher_name,
          user_id: e.user_id,
          semester: e.semester,
          subject: e.subject,
          topic: e.topic_covered,
          hours: 0
        };
      }
      groupMap[key].hours += calculateDuration(e.start_time, e.end_time);
    });
    expandedRows = Object.values(groupMap);
  }

  // Helper to get month options from timeOff data
  const monthOptions = years.flatMap(year =>
    Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return {
        value: `${year}-${month}`,
        label: `${new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' })} ${year}`
      };
    })
  );

  // Build a userId-to-name map from entries and also fetch all teachers
  const userIdToName = {};
  entries.forEach(e => {
    if (e.user_id && e.teacher_name) {
      userIdToName[e.user_id] = e.teacher_name;
    }
  });

  // Fetch all teachers to ensure we have names for all users
  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teachers');
        const teachers = await response.json();
        const teacherMap = {};
        teachers.forEach(teacher => {
          teacherMap[teacher.id] = teacher.name;
        });
        // Merge with existing mapping, prioritizing diary entries
        Object.keys(teacherMap).forEach(id => {
          if (!userIdToName[id]) {
            userIdToName[id] = teacherMap[id];
          }
        });
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchAllTeachers();
  }, []);

  // Group filtered leaves by teacher
  const leavesByTeacher = {};
  filteredLeaves.forEach(l => {
    if (!leavesByTeacher[l.user_id]) {
      leavesByTeacher[l.user_id] = [];
    }
    leavesByTeacher[l.user_id].push(l);
  });

  // Prepare analytics rows
  const timeOffAnalyticsRows = Object.entries(leavesByTeacher).map(([userId, offs]) => {
    const totalDays = offs.reduce((sum, l) => sum + Number(l.days), 0);
    const teacherName = offs[0]?.teacher_name || offs[0]?.applicant_name || userId;
    return {
      userId,
      teacherName,
      totalDays,
      offs
    };
  });

  // For bar chart: find max days for scaling
  const maxDays = Math.max(1, ...timeOffAnalyticsRows.map(r => r.totalDays));

  // Helper to get month name
  function getMonthName(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // Handler for Total Lectures card click
  const handleTotalLecturesClick = () => {
    setShowCourseSummary(s => {
      if (!s) {
        setShowTimeOffAnalytics(false);
        setShowCourseCompletion(false);
      }
      return !s;
    });
  };
  // Handler for Total Time-Off card click
  const handleTotalTimeOffClick = () => {
    setShowTimeOffAnalytics(s => {
      if (!s) {
        setShowCourseSummary(false);
        setShowCourseCompletion(false);
      }
      return !s;
    });
  };

  const handleTotalCoursesTaughtClick = async () => {
    setShowCourseCompletion(s => {
      if (!s) {
        setShowCourseSummary(false);
        setShowTimeOffAnalytics(false);
        fetchCourseCompletionAnalytics();
      }
      return !s;
    });
  };

  async function fetchCourseCompletionAnalytics() {
    setLoadingCompletion(true);
    try {
      // 1. Fetch all courses
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const courses = await coursesRes.json();
      // 2. For each course, fetch all subjects (for all semesters 1-6)
      const courseAnalytics = await Promise.all(courses.map(async (course) => {
        let allSubjects = [];
        for (let sem = 1; sem <= 6; sem++) {
          const subjectsRes = await fetch(`http://localhost:5000/api/subjects?course_id=${course.id}&semester=Semester%20${sem}`);
          const subjects = await subjectsRes.json();
          allSubjects = allSubjects.concat(subjects);
        }
        // 3. For each subject, fetch all topics
        let allTopics = [];
        for (let subj of allSubjects) {
          const topicsRes = await fetch(`http://localhost:5000/api/topics?subject_id=${subj.id}`);
          const topics = await topicsRes.json();
          allTopics = allTopics.concat(topics.map(t => ({ ...t, subjectName: subj.name })));
        }
        // 4. Count unique topics covered in diary entries for this course
        const courseEntries = entries.filter(e => e.course_name === course.name);
        const coveredTopics = new Set(courseEntries.map(e => e.topic_covered && e.topic_covered.trim()).filter(Boolean));
        // 5. Calculate completion
        const totalTopics = allTopics.length;
        const coveredCount = allTopics.filter(t => coveredTopics.has(t.name)).length;
        const percent = totalTopics > 0 ? (coveredCount / totalTopics) * 100 : 0;
        return {
          courseName: course.name,
          totalTopics,
          coveredCount,
          percent: percent.toFixed(1),
        };
      }));
      setCourseCompletionData(courseAnalytics);
    } catch (err) {
      setCourseCompletionData([]);
    }
    setLoadingCompletion(false);
  }

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || '';

  // Group by teacher
  const teacherStats = {};
  entries.forEach(e => {
    if (!e.teacher_name) return;
    if (!teacherStats[e.teacher_name]) {
      teacherStats[e.teacher_name] = { lectures: 0, hours: 0 };
    }
    teacherStats[e.teacher_name].lectures += 1;
    teacherStats[e.teacher_name].hours += calculateDuration(e.start_time, e.end_time);
  });
  const teacherStatsArr = Object.entries(teacherStats).map(([name, stats]) => ({
    name,
    lectures: stats.lectures,
    hours: stats.hours
  }));

  const handleAddTeacher = async (form) => {
    try {
      const res = await fetch('http://localhost:5000/api/add-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Teacher added successfully!');
        setShowAddTeacher(false);
        fetchTeachers(); // Refresh teachers list
      } else {
        alert(data.message || 'Failed to add teacher');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const handleEditTeacher = async (form) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Teacher updated successfully!');
      setEditTeacher(null);
      fetchTeachers();
    } else {
      alert(data.message || 'Failed to update teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      alert('Teacher deleted successfully!');
      setDeleteTeacher(null);
      fetchTeachers();
    } else {
      alert(data.message || 'Failed to delete teacher');
    }
  };

  const handleExport = async (option, extra = {}) => {
    if (option === 'date-range' || option === 'month-wise') {
      // Backend export
      let url = 'http://localhost:5000/api/export-excel?type=' + option;
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
      data = entries.map(e => ({
        Date: e.date,
        Teacher: e.teacher_name,
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
      data = entries.map(e => ({
        Course: e.course_name,
        Teacher: e.teacher_name,
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
      data = entries.map(e => ({
        Semester: e.semester,
        Teacher: e.teacher_name,
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
      <div ref={containerRef} className="backdrop-blur-2xl bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-screen-xl flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        {userName && (
          <div className="w-full flex justify-start items-center mb-2">
            <span className="text-lg font-semibold text-blue-800">Welcome, {userName}!</span>
          </div>
        )}
        <div className="w-full flex justify-end items-center mb-4 gap-4">
          <button
            onClick={() => navigate('/admin-management')}
            className="px-6 py-2 rounded-xl border border-white/30 bg-purple-600/80 text-white font-semibold shadow-lg backdrop-blur-xl hover:bg-purple-700/90 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', fontWeight: 700, fontSize: '1rem'}}>
            Admin Management Panel
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-2 rounded-xl border border-white/30 bg-blue-600/80 text-white font-semibold shadow-lg backdrop-blur-xl hover:bg-blue-700/90 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', fontWeight: 700, fontSize: '1rem'}}>
            Export to Excel
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl border border-white/30 bg-white/30 text-blue-800 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/50 hover:text-blue-900 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', fontWeight: 700, fontSize: '1rem'}}>
            Logout
          </button>
        </div>
        {showAddTeacher && (
          <AddTeacherModal onClose={() => setShowAddTeacher(false)} onSubmit={handleAddTeacher} />
        )}
        <h1 className="text-4xl font-extrabold text-blue-900 mb-10 text-center drop-shadow">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-6 w-full mb-10">
          <div onClick={handleTotalLecturesClick} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Total Lectures" value={totalLectures} />
          </div>
          <div onClick={handleTotalTimeOffClick} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Total Time-Off" value={totalTimeOff} />
          </div>
          <div onClick={handleTotalCoursesTaughtClick} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Total Courses Taught" value={totalCoursesTaught} />
          </div>
          <div onClick={() => {
            setShowLecturesByTeacher(s => {
              if (!s) {
                setShowCourseSummary(false);
                setShowTimeOffAnalytics(false);
                setShowCourseCompletion(false);
              }
              return !s;
            });
          }} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Lectures by Teacher" value={teacherStatsArr.length} />
          </div>
        </div>
        {/* Course summary table below Total Lectures */}
        {showCourseSummary && (
        <div className="w-full mb-10">
          <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold text-blue-800">Course Lecture Summary</h2>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-blue-700">Select Month:</label>
                <select
                  value={selectedCourseMonth}
                  onChange={e => setSelectedCourseMonth(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {monthOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No. of Lectures</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {courseLectureCounts.length === 0 ? (
                    <tr><td colSpan={2} className="text-center py-4 text-gray-400">No course or lecture records for this month</td></tr>
                  ) : (
                    courseLectureCounts.map((course, idx) => (
                      <React.Fragment key={course.name}>
                        <tr>
                          <td className="px-4 py-2">
                            <button
                              className="text-blue-700 font-semibold rounded px-2 py-1 transition hover:bg-blue-100 focus:bg-blue-200 focus:outline-none"
                              style={{ textDecoration: 'none', fontWeight: 500 }}
                              onClick={() => setExpandedCourse(expandedCourse === course.name ? null : course.name)}
                            >
                              {course.name}
                            </button>
                          </td>
                          <td className="px-4 py-2">{course.count}</td>
                        </tr>
                        {expandedCourse === course.name && (
                          <tr>
                            <td colSpan={2} className="bg-blue-50 px-4 py-4 rounded-b-xl">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg">
                                  <thead className="bg-blue-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teacher</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topic</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Hours</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {expandedRows.length === 0 ? (
                                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No data</td></tr>
                                    ) : (
                                      expandedRows.map((row, i) => (
                                        <tr key={i}>
                                          <td className="px-4 py-2">{row.teacher || row.teacher_name || row.user_id}</td>
                                          <td className="px-4 py-2">{row.semester}</td>
                                          <td className="px-4 py-2">{row.subject}</td>
                                          <td className="px-4 py-2">{row.topic}</td>
                                          <td className="px-4 py-2">{row.hours.toFixed(2)}</td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
        {/* Time-Off Analytics expandable section */}
        {showTimeOffAnalytics && (
          <div className="w-full mb-10">
            <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-blue-800">Time-Off Analytics</h2>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-blue-700">Select Year:</label>
                  <select
                    value={selectedTimeOffYear}
                    onChange={e => {
                      setSelectedTimeOffYear(Number(e.target.value));
                      // If current year, clamp month if needed
                      if (Number(e.target.value) < currentYear && Number(selectedTimeOffMonth) > 12) {
                        setSelectedTimeOffMonth('12');
                      } else if (Number(e.target.value) === currentYear && Number(selectedTimeOffMonth) > currentMonth) {
                        setSelectedTimeOffMonth(String(currentMonth).padStart(2, '0'));
                      }
                    }}
                    className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <label className="font-semibold text-blue-700 ml-2">Select Month:</label>
                  <select
                    value={selectedTimeOffMonth}
                    onChange={e => setSelectedTimeOffMonth(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {filteredMonths.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="mb-8">
                <h3 className="font-semibold text-blue-700 mb-2">Total Days Off per Teacher</h3>
                <div className="flex flex-col gap-3">
                  {timeOffAnalyticsRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <button
                        className={`w-32 font-semibold rounded transition ${
                          selectedTeacher === row.teacherName
                            ? 'bg-blue-200 text-blue-900'
                            : 'text-blue-800 hover:bg-blue-100'
                        }`}
                        style={{ outline: selectedTeacher === row.teacherName ? '2px solid #2563eb' : 'none' }}
                        onClick={() =>
                          setSelectedTeacher(selectedTeacher === row.teacherName ? null : row.teacherName)
                        }
                      >
                        {row.teacherName}
                      </button>
                      <div className="flex-1 bg-blue-100 rounded h-6 relative">
                        <div
                          className="bg-blue-500 h-6 rounded transition-all"
                          style={{ width: `${(row.totalDays / maxDays) * 100}%`, minWidth: '2rem' }}
                        ></div>
                        <span className="absolute left-2 top-0 h-6 flex items-center font-bold text-white drop-shadow">
                          {row.totalDays}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTeacher && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-200 text-blue-900 rounded font-semibold"
                    onClick={() => setSelectedTeacher(null)}
                  >
                    Show All Teachers
                  </button>
                )}
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teacher</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Month</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Days</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredLeaves.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No time-off records</td></tr>
                    ) : (
                      filteredLeaves
                        .filter(l => !selectedTeacher || (l.teacher_name || l.applicant_name) === selectedTeacher)
                        .map((l, idx) => (
                          <tr key={l.id}>
                            <td className="px-4 py-2 font-semibold text-blue-700">{l.teacher_name || l.applicant_name || l.user_id}</td>
                            <td className="px-4 py-2">{new Date(l.start_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{getMonthName(l.start_date)}</td>
                            <td className="px-4 py-2">{l.days}</td>
                            <td className="px-4 py-2">{l.reason || 'No reason'}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Course Completion Analytics expandable section */}
        {showCourseCompletion && (
          <div className="w-full mb-10">
            <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Course Completion Analytics</h2>
              {loadingCompletion ? (
                <div className="text-blue-700 text-center py-8 font-semibold">Loading analytics...</div>
              ) : courseCompletionData.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No data available.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topics Covered</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Topics</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Completion %</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {courseCompletionData.map((row, idx) => (
                      <tr key={row.courseName} className={idx % 2 === 0 ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-2 font-semibold text-blue-800">{row.courseName}</td>
                        <td className="px-4 py-2">{row.coveredCount}</td>
                        <td className="px-4 py-2">{row.totalTopics}</td>
                        <td className="px-4 py-2">{row.percent}%</td>
                        <td className="px-4 py-2">
                          <div className="w-full h-5 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-full shadow-inner relative overflow-hidden">
                            <div
                              className="h-5 rounded-full transition-all flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow"
                              style={{ width: `${row.percent}%`, minWidth: '2rem', position: 'absolute', left: 0, top: 0 }}
                            >
                              <span className="w-full text-center font-bold text-white text-xs drop-shadow" style={{ position: 'relative', zIndex: 2 }}>
                                {row.percent}%
                              </span>
                            </div>
                            {/* Always show the label, even if bar is very small */}
                            {parseFloat(row.percent) < 15 && (
                              <span className="absolute left-2 top-0 h-5 flex items-center font-bold text-blue-700 text-xs" style={{ zIndex: 1 }}>
                                {row.percent}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {showLecturesByTeacher && (
          <div className="w-full mb-10">
            <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Lectures by Teacher</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teacher</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Lectures</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {teacherStatsArr.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-400">No data</td></tr>
                    ) : (
                      teacherStatsArr.map((row, idx) => (
                        <tr key={row.name} className={idx % 2 === 0 ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-2 font-semibold text-blue-800">{row.name}</td>
                          <td className="px-4 py-2">{row.lectures}</td>
                          <td className="px-4 py-2">{row.hours.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="w-full mb-10">
          <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 mb-8 border border-white/30 mx-auto" style={{width: '80vw', maxWidth: '1600px'}}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold text-blue-800">Teachers</h2>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-blue-700 ml-4">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <label className="font-semibold text-blue-700 ml-4">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto diary-log-table">
              <table ref={teachersTableRef} className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teacher</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topic</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Lecture No.</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Start Time</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">End Time</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Duration (hrs)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredDiaryEntries.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-4 text-gray-400">No diary entries found.</td></tr>
                  ) : (
                    filteredDiaryEntries.map((e, idx) => (
                      <tr
                        key={e.id}
                        className={idx % 2 === 0 ? 'bg-blue-50' : ''}
                        ref={el => diaryLogRowRefs.current[idx] = el}
                      >
                        <td className="px-6 py-3">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{e.teacher_name}</td>
                        <td className="px-4 py-2">{e.course_name}</td>
                        <td className="px-4 py-2">{e.semester}</td>
                        <td className="px-4 py-2">{e.subject}</td>
                        <td className="px-4 py-2">{e.topic_covered}</td>
                        <td className="px-4 py-2">{e.lecture_number}</td>
                        <td className="px-4 py-2">{e.start_time}</td>
                        <td className="px-4 py-2">{e.end_time}</td>
                        <td className="px-4 py-2">{((e.start_time && e.end_time) ? ((Number(e.end_time.split(':')[0]) * 60 + Number(e.end_time.split(':')[1])) - (Number(e.start_time.split(':')[0]) * 60 + Number(e.start_time.split(':')[1]))) / 60 : 0).toFixed(2)}</td>
                        <td className="px-4 py-2">{e.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {editTeacher && <EditTeacherModal teacher={editTeacher} onClose={() => { setEditTeacher(null); }} onSubmit={handleEditTeacher} tableRef={teachersTableRef} containerRef={containerRef} diaryLogRowRefs={diaryLogRowRefs} diaryLogRowCount={filteredDiaryEntries.length} />}
        {deleteTeacher && <ConfirmDeleteModal teacher={deleteTeacher} onClose={() => { setDeleteTeacher(null); }} onConfirm={() => handleDeleteTeacher(deleteTeacher.id)} containerRef={containerRef} teachersHeadingRef={teachersHeadingRef} />}
        {showExportModal && (
          <ExportExcelModal onClose={() => setShowExportModal(false)} onExport={handleExport} />
        )}

      </div>
    </div>
  );
} 