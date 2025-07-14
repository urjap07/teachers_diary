import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [selectedCourseMonth, setSelectedCourseMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedTimeOffMonth, setSelectedTimeOffMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null); // NEW
  // Diary Log Table month filter state
  const [selectedDiaryMonth, setSelectedDiaryMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  // Month options for 2025 and 2026
  const diaryYears = [2025];
  const diaryMonthOptions = diaryYears.flatMap(year =>
    Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return {
        value: `${year}-${month}`,
        label: `${new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' })} ${year}`
      };
    })
  );
  // Filter entries for selected month
  const filteredDiaryEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return ym === selectedDiaryMonth;
  });

  const [showCourseCompletion, setShowCourseCompletion] = useState(false);
  const [courseCompletionData, setCourseCompletionData] = useState([]);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [showLecturesByTeacher, setShowLecturesByTeacher] = useState(false);

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
  const years = [2025]; // Now includes 2026
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
    return ym === selectedTimeOffMonth;
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200 py-10">
      <div className="backdrop-blur-2xl bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-screen-xl flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        {userName && (
          <div className="w-full flex justify-start items-center mb-2">
            <span className="text-lg font-semibold text-blue-800">Welcome, {userName}!</span>
          </div>
        )}
        <div className="w-full flex justify-end items-center mb-4">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl border border-white/30 bg-white/30 text-blue-800 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/50 hover:text-blue-900 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', fontWeight: 700, fontSize: '1rem'}}>
            Logout
          </button>
        </div>
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
                  <label className="font-semibold text-blue-700">Select Month:</label>
                  <select
                    value={selectedTimeOffMonth}
                    onChange={e => setSelectedTimeOffMonth(e.target.value)}
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
                    {timeOffAnalyticsRows.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No time-off records</td></tr>
                    ) : (
                      timeOffAnalyticsRows
                        .filter(row => !selectedTeacher || row.teacherName === selectedTeacher)
                        .flatMap((row, idx) =>
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
              <h2 className="text-2xl font-bold text-blue-800">Diary Log Table</h2>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-blue-700">Select Month:</label>
                <select
                  value={selectedDiaryMonth}
                  onChange={e => setSelectedDiaryMonth(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {diaryMonthOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
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
                      <tr key={e.id} className={idx % 2 === 0 ? 'bg-blue-50' : ''}>
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
      </div>
    </div>
  );
} 