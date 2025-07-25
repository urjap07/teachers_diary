import React, { useEffect, useState } from 'react';

// Add this to your global CSS or index.css:
// .holiday-tile {
//   background: #f87171 !important; /* Tailwind red-400 */
//   color: white !important;
//   border-radius: 50%;
// }

function calculateDuration(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

function StatCard({ title, value, onClick, active, tooltip }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 flex-1 cursor-pointer transition text-center border
        ${active ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100 hover:shadow-lg'}`}
      onClick={onClick}
      title={tooltip}
    >
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-3xl font-bold text-blue-700 mt-2">{value}</div>
    </div>
  );
}

// Month options for 2025 and 2026
const diaryYears = [2025, 2026];
const diaryMonthOptions = diaryYears.flatMap(year =>
  Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return {
      value: `${year}-${month}`,
      label: `${new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' })} ${year}`
    };
  })
);

export default function DiarySummary({ userId }) {
  const [entries, setEntries] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  // Remove timeOff state
  const [leaves, setLeaves] = useState([]); // Only use leaves
  // Remove showCoursesTaught, use expanded === 'courses'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [leaveBalances, setLeaveBalances] = useState([]);

  // Filter entries and timeOff by selected month
  const filteredEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return ym === selectedMonth;
  });
  // const filteredTimeOff = timeOff.filter(t => {
  //   if (!t.date) return false;
  //   const d = new Date(t.date);
  //   const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  //   return ym === selectedMonth;
  // });

  useEffect(() => {
    // Fetch only this teacher's diary entries
    fetch(`http://localhost:5000/api/diary-entries?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setEntries(Array.isArray(data) ? data : []);
      });
    // Remove time-off fetch
    // Fetch leaves for this user
    fetch(`http://localhost:5000/api/leaves?user_id=${Number(userId)}`)
      .then(res => res.json())
      .then(data => {
        setLeaves(Array.isArray(data) ? data : []);
      });
    // Fetch leave balances for admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'admin') {
      fetch(`http://localhost:5000/api/leave-balances?user_id=${userId}`)
        .then(res => res.json())
        .then(data => setLeaveBalances(Array.isArray(data) ? data : []));
    }
  }, [userId]);


  const totalLectures = entries.length;
  const totalHours = entries.reduce((sum, e) => sum + calculateDuration(e.start_time, e.end_time), 0);
  // Show the real total time-off (sum of days from leaves only)
  const totalTimeOff = leaves.reduce((sum, l) => sum + Number(l.days), 0);

  // Group by course_name, semester, topic_covered for lectures breakdown
  const topicGroups = {};
  entries.forEach(e => {
    const key = `${e.course_name}|${e.semester}|${e.topic_covered}`;
    if (!topicGroups[key]) {
      topicGroups[key] = {
        course_name: e.course_name,
        semester: e.semester,
        topic_covered: e.topic_covered,
        count: 0,
      };
    }
    topicGroups[key].count += 1;
  });
  const groupedTopics = Object.values(topicGroups);

  // When a course is clicked, show breakdown by date
  let courseDateBreakdown = [];
  if (selectedCourse) {
    // Filter entries for the selected course
    const filtered = entries.filter(e => e.course_name === selectedCourse);
    // Group by date
    const dateGroups = {};
    filtered.forEach(e => {
      if (!dateGroups[e.date]) {
        dateGroups[e.date] = [];
      }
      dateGroups[e.date].push(e);
    });
    courseDateBreakdown = Object.entries(dateGroups).map(([date, lectures]) => ({
      date,
      lectures,
      count: lectures.length,
      topics: [...new Set(lectures.map(l => l.topic_covered))].join(', ')
    }));
  }

  // Calculate total unique courses taught (by name, all time, original format)
  const uniqueCoursesMap = new Map();
  entries.forEach(e => {
    const orig = (e.course_name || '').trim();
    const key = orig.toLowerCase();
    if (orig && !uniqueCoursesMap.has(key)) {
      uniqueCoursesMap.set(key, orig);
    }
  });
  const uniqueCourses = Array.from(uniqueCoursesMap.values());
  const totalCoursesTaught = uniqueCourses.length;

  // Handlers for showing details
  const showLectures = () => setExpanded(expanded === 'lectures' ? null : 'lectures');
  const showHours = () => setExpanded(expanded === 'hours' ? null : 'hours');
  const showTimeOff = () => setExpanded(expanded === 'timeoff' ? null : 'timeoff');
  const showCoursesTaught = () => setExpanded(expanded === 'courses' ? null : 'courses');
  const showTeacherLectures = () => setExpanded(expanded === 'teacherlectures' ? null : 'teacherlectures');

  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Leave Balances Table for Admin */}
      {userRole === 'admin' && leaveBalances.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 shadow">
          <h3 className="font-semibold text-blue-700 mb-2">Leave Balances ({new Date().getFullYear()})</h3>
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
              {leaveBalances.map((b, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-semibold text-blue-800">{b.leave_type_name}</td>
                  <td className="px-4 py-2">{b.opening_balance}</td>
                  <td className="px-4 py-2">{b.used}</td>
                  <td className="px-4 py-2">{b.adjustments}</td>
                  <td className="px-4 py-2 font-bold text-green-700">{(parseFloat(b.opening_balance) - parseFloat(b.used) + parseFloat(b.adjustments)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <StatCard title="Total Lectures" value={totalLectures} onClick={showLectures} active={expanded === 'lectures'} />
        <StatCard title="Total Hours" value={totalHours.toFixed(2)} onClick={showHours} active={expanded === 'hours'} />
        <StatCard title="Time-Off" value={totalTimeOff} onClick={showTimeOff} active={expanded === 'timeoff'} />
        <StatCard title="Total Courses Taught" value={totalCoursesTaught} onClick={showCoursesTaught} active={expanded === 'courses'} />
        {userRole === 'admin' && (
          <StatCard title="Lectures by Teacher" value={totalLectures} onClick={showTeacherLectures} active={expanded === 'teacherlectures'} />
        )}
      </div>
      {expanded === 'courses' && totalCoursesTaught > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shadow">
          <div className="mb-4 flex items-center gap-2 justify-end">
            <label className="font-semibold text-blue-700">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {diaryMonthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold text-blue-700 mb-2">Courses Taught</h3>
          <ul className="list-disc pl-6 text-blue-700">
            {uniqueCourses.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      {userRole === 'admin' && expanded === 'teacherlectures' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shadow">
          <div className="mb-4 flex items-center gap-2 justify-end">
            <label className="font-semibold text-blue-700">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {diaryMonthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold text-blue-700 mb-2">Lectures by Teacher</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teacher</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Lectures</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {/* For teacher dashboard, only one teacher: */}
              <tr>
                <td className="px-4 py-2 font-semibold text-blue-800">You</td>
                <td className="px-4 py-2">{totalLectures}</td>
                <td className="px-4 py-2">{totalHours.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {/* Details Section */}
      {expanded === 'lectures' && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow">
          <div className="mb-4 flex items-center gap-2 justify-end">
            <label className="font-semibold text-blue-700">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {diaryMonthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold mb-2 text-blue-700">Lectures Breakdown</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topic</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No. of Lectures</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {groupedTopics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">No data</td>
                </tr>
              ) : (
                groupedTopics.map((g, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-700 font-semibold rounded px-2 py-1 transition hover:bg-blue-100 focus:bg-blue-200 focus:outline-none"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setSelectedCourse(g.course_name)}
                      >
                        {g.course_name}
                      </button>
                    </td>
                    <td className="px-4 py-2">{g.semester}</td>
                    <td className="px-4 py-2">{g.topic_covered}</td>
                    <td className="px-4 py-2">{g.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Breakdown by date for selected course */}
          {selectedCourse && (
            <div className="bg-blue-100 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-blue-700">
                  Breakdown for {selectedCourse}
                </h4>
                <button
                  className="text-blue-700 font-semibold rounded px-2 py-1 transition hover:bg-blue-100 focus:bg-blue-200 focus:outline-none"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topics</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No. of Lectures</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDateBreakdown.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{row.topics}</td>
                      <td className="px-4 py-2">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {expanded === 'hours' && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow">
          <div className="mb-4 flex items-center gap-2 justify-end">
            <label className="font-semibold text-blue-700">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {diaryMonthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold mb-2 text-blue-700">Hours Breakdown</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Hours</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Topic</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">No data</td>
                </tr>
              ) : (
                filteredEntries.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-2">{e.course_name}</td>
                    <td className="px-4 py-2">{calculateDuration(e.start_time, e.end_time).toFixed(2)}</td>
                    <td className="px-4 py-2">{e.topic_covered}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {expanded === 'timeoff' && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow">
          <div className="mb-4 flex items-center gap-2 justify-end">
            <label className="font-semibold text-blue-700">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {diaryMonthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold mb-2 text-blue-700">Time-Off Breakdown</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Days</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">No time-off records</td>
                </tr>
              ) : (
                leaves.map((l, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{new Date(l.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{l.days}</td>
                    <td className="px-4 py-2">{l.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 