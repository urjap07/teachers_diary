import React, { useState, useEffect } from 'react';

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

export default function AdminDashboard() {
  const [entries, setEntries] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showCourseSummary, setShowCourseSummary] = useState(false); // NEW
  const [showTimeOffAnalytics, setShowTimeOffAnalytics] = useState(false); // NEW
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/diary-entries')
      .then(res => res.json())
      .then(data => setEntries(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/time-off')
      .then(res => res.json())
      .then(data => setTimeOff(Array.isArray(data) ? data : []));
  }, []);

  const totalLectures = entries.length;
  const totalTimeOff = timeOff.reduce((sum, t) => sum + Number(t.days), 0);
  const uniqueCourses = Array.from(new Set(entries.map(e => (e.course_name || '').trim())));
  const totalCoursesTaught = uniqueCourses.length;

  // Group entries by course for summary
  const courseLectureCounts = uniqueCourses.map(course => ({
    name: course,
    count: entries.filter(e => (e.course_name || '').trim() === course).length
  }));

  // For expanded course: group by teacher, semester, subject, topic
  let expandedRows = [];
  if (expandedCourse) {
    const filtered = entries.filter(e => (e.course_name || '').trim() === expandedCourse);
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
  const years = [2025]; // Add more years as needed
  const monthOptions = years.flatMap(year =>
    Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return {
        value: `${year}-${month}`,
        label: `${new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' })} ${year}`
      };
    })
  );

  // Filter timeOff by selected month
  const filteredTimeOff = timeOff.filter(t => {
    if (!t.date) return false;
    const d = new Date(t.date);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return ym === selectedMonth;
  });

  // Build a userId-to-name map from entries
  const userIdToName = {};
  entries.forEach(e => {
    if (e.user_id && e.teacher_name) {
      userIdToName[e.user_id] = e.teacher_name;
    }
  });

  // Group filtered time-off by teacher
  const timeOffByTeacher = {};
  filteredTimeOff.forEach(t => {
    if (!timeOffByTeacher[t.user_id]) {
      timeOffByTeacher[t.user_id] = [];
    }
    timeOffByTeacher[t.user_id].push(t);
  });

  // Prepare analytics rows
  const timeOffAnalyticsRows = Object.entries(timeOffByTeacher).map(([userId, offs]) => {
    const totalDays = offs.reduce((sum, t) => sum + Number(t.days), 0);
    return {
      userId,
      teacherName: userIdToName[userId] || userId,
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
  const handleTotalLecturesClick = () => setShowCourseSummary(s => !s);
  // Handler for Total Time-Off card click
  const handleTotalTimeOffClick = () => setShowTimeOffAnalytics(s => !s);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200 py-10">
      <div className="backdrop-blur-2xl bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-6xl flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-10 text-center drop-shadow">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-6 w-full mb-10">
          <div onClick={handleTotalLecturesClick} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Total Lectures" value={totalLectures} />
          </div>
          <div onClick={handleTotalTimeOffClick} style={{cursor:'pointer', flex:1}}>
            <StatCard title="Total Time-Off" value={totalTimeOff} />
          </div>
          <StatCard title="Total Courses Taught" value={totalCoursesTaught} />
        </div>
        {/* Course summary table below Total Lectures */}
        {showCourseSummary && (
        <div className="w-full mb-10">
          <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Course Lecture Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No. of Lectures</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {courseLectureCounts.map((course, idx) => (
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
                  ))}
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
                  <label className="font-semibold text-blue-700">Select Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="mb-8">
                <h3 className="font-semibold text-blue-700 mb-2">Total Days Off per Teacher</h3>
                <div className="flex flex-col gap-3">
                  {timeOffAnalyticsRows.length === 0 ? (
                    <div className="text-gray-400 text-center">No time-off records for this month</div>
                  ) : (
                    timeOffAnalyticsRows.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-32 font-semibold text-blue-800">{row.teacherName}</span>
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
                    ))
                  )}
                </div>
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
                    {timeOffAnalyticsRows.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No time-off records</td></tr>
                    ) : (
                      timeOffAnalyticsRows.flatMap((row, idx) =>
                        row.offs.map((t, i) => (
                          <tr key={row.userId + '-' + i}>
                            <td className="px-4 py-2 font-semibold text-blue-700">{row.teacherName}</td>
                            <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{getMonthName(t.date)}</td>
                            <td className="px-4 py-2">{t.days}</td>
                            <td className="px-4 py-2">{t.reason || 'No reason'}</td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="w-full mb-10">
          <div className="bg-white/40 backdrop-blur-lg rounded-xl shadow p-6 mb-8 border border-white/30">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Diary Log Table</h2>
            <div className="text-gray-400 text-center">(All teachers, all courses) — Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
} 