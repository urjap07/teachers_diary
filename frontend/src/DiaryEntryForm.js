import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeOffForm from './TimeOffForm';

export default function DiaryEntryForm({ userId }) {
  const [form, setForm] = useState({
    course: '',
    semester: '',
    lecture: '',
    startTime: '',
    endTime: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    topic: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [isPublicHoliday, setIsPublicHoliday] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const leaveTypes = [
    { value: 'Casual Leave (CL)', label: 'Casual Leave (CL)', id: 1 },
    { value: 'Sick Leave (SL)', label: 'Sick Leave (SL)', id: 2 },
    { value: 'Earned Leave (EL)', label: 'Earned Leave (EL)', id: 3 },
    { value: 'Leave Without Pay (LWP)', label: 'Leave Without Pay (LWP)', id: 4 },
    { value: 'Maternity Leave (ML)', label: 'Maternity Leave (ML)', id: 5 }
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Adjust as per your auth logic
    localStorage.removeItem('user'); // Remove persisted user
    navigate('/login');
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'teacher') {
      fetch(`http://localhost:5000/api/teacher-courses?teacher_id=${user.id}`)
        .then(res => res.json())
        .then(ids => {
          if (Array.isArray(ids) && ids.length > 0) {
            fetch('http://localhost:5000/api/courses')
              .then(res => res.json())
              .then(allCourses => {
                setCourses(allCourses.filter(c => ids.includes(c.id)));
              });
          } else {
            setCourses([]);
          }
        })
        .catch(() => setCourses([]));
    } else {
      // fallback for admin or if you want all courses
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []))
        .catch(() => setCourses([]));
    }
  }, []);

  useEffect(() => {
    if (form.course && form.semester) {
      fetch(`http://localhost:5000/api/subjects?course_id=${form.course}&semester=${encodeURIComponent(form.semester)}`)
        .then(res => res.json())
        .then(data => setSubjects(data))
        .catch(() => setSubjects([]));
      setForm(f => ({ ...f, subject: '', topic: '' }));
    } else {
      setSubjects([]);
      setForm(f => ({ ...f, subject: '', topic: '' }));
    }
  }, [form.course, form.semester]);

  useEffect(() => {
    if (form.subject) {
      fetch(`http://localhost:5000/api/topics?subject_id=${form.subject}`)
        .then(res => res.json())
        .then(data => setTopics(data))
        .catch(() => setTopics([]));
      setForm(f => ({ ...f, topic: '' }));
    } else {
      setTopics([]);
      setForm(f => ({ ...f, topic: '' }));
    }
  }, [form.subject]);

  // Fetch subtopics when topic changes
  useEffect(() => {
    if (form.topic) {
      fetch(`http://localhost:5000/api/subtopics?topic_id=${form.topic}`)
        .then(res => res.json())
        .then(data => setSubtopics(Array.isArray(data) ? data : []));
      setForm(f => ({ ...f, subtopic: '' }));
    } else {
      setSubtopics([]);
      setForm(f => ({ ...f, subtopic: '' }));
    }
  }, [form.topic]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'teacher') {
      fetch(`http://localhost:5000/api/time-off?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const today = new Date();
          const hasHoliday = Array.isArray(data) && data.some(t => {
            if (!t.date) return false;
            const holidayDate = new Date(t.date);
            return (
              holidayDate.getFullYear() === today.getFullYear() &&
              holidayDate.getMonth() === today.getMonth() &&
              holidayDate.getDate() === today.getDate()
            );
          });
          setIsHoliday(hasHoliday);
        });
    }
  }, []);

  // Fetch public holidays on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/holidays')
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          return [];
        }
      })
      .then(data => setPublicHolidays(Array.isArray(data) ? data : []))
      .catch(() => setPublicHolidays([]));
  }, []);

  // Check if selected date is a public holiday
  useEffect(() => {
    if (!form.date || publicHolidays.length === 0) {
      setIsPublicHoliday(false);
      return;
    }
    console.log('Comparing:', publicHolidays.map(h => h.date), 'with', form.date);
    setIsPublicHoliday(
      publicHolidays.some(
        h => String(h.date).trim() === String(form.date).trim()
      )
    );
  }, [form.date, publicHolidays]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.course) errs.course = 'Course is required';
    if (!form.semester) errs.semester = 'Semester is required';
    if (!form.lecture) errs.lecture = 'Lecture/Class is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.subject) errs.subject = 'Subject is required';
    if (!form.topic) errs.topic = 'Topic/Unit is required';
    if (!form.subtopic) errs.subtopic = 'Subtopic is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      try {
        const res = await fetch('http://localhost:5000/api/diary-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            course_id: form.course,
            semester: form.semester,
            lecture_number: form.lecture.replace('Lecture ', ''),
            start_time: form.startTime,
            end_time: form.endTime,
            date: form.date,
            subject_id: form.subject,
            topic_id: form.topic,
            subtopic_id: form.subtopic,
            remarks: form.remarks,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          alert('Details submitted successfully!');
        } else {
          alert(data.message || 'Submission failed');
        }
      } catch (err) {
        alert('Server error');
      }
    }
  };

  const shiftTimings = {
    morning: { start: '08:00', end: '12:00' },
    afternoon: { start: '12:01', end: '16:00' },
    evening: { start: '16:01', end: '20:00' }
  };
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || '';
  const shift = user?.shift;
  const { start: shiftStart, end: shiftEnd } = shift ? shiftTimings[shift] : { start: undefined, end: undefined };
  console.log('User:', user, 'Shift:', shift, 'Shift times:', shiftStart, shiftEnd);

  function getTimeOptions(start, end) {
    const options = [];
    let [h, m] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    while (h < endH || (h === endH && m <= endM)) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      m += 30;
      if (m >= 60) { h++; m = 0; }
    }
    return options;
  }
  const allowedTimes = (shiftStart && shiftEnd) ? getTimeOptions(shiftStart, shiftEnd) : [];



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-lg relative flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        {userName && (
          <div className="w-full flex justify-start items-center mb-2 relative">
            <span className="text-lg font-semibold text-blue-800">Welcome, {userName}!</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="inline-block w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/60 text-blue-900 font-medium text-sm shadow hover:bg-white/80 transition"
                onClick={handleLogout}
              >
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
        <div className="w-full flex justify-end items-center mb-6">
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-lg bg-white/60 text-blue-900 font-semibold shadow hover:bg-white/80 transition"
            onClick={() => setShowLeaveModal(v => !v)}
          >
            Apply for Leave
          </button>
        </div>
        {leaveMsg && (
          <div
            className="mx-auto mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-800 font-bold rounded-2xl shadow-2xl text-xl"
            style={{ maxWidth: '400px', textAlign: 'center' }}
          >
            {leaveMsg}
          </div>
        )}
        {showLeaveModal && (
          <div className="mb-8 w-full flex justify-center">
            <div
              className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-2xl rounded-2xl max-w-lg w-full min-h-[340px] p-8 flex flex-col items-center"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', border: '1.5px solid rgba(255,255,255,0.18)' }}
            >
              <h2 className="text-2xl font-bold mb-8 text-blue-900 drop-shadow">Apply for Leave</h2>
              <label className="block text-gray-800 mb-2 font-semibold">Reason</label>
              <select
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-4 mt-4"
              >
                <option value="">Select reason</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <label className="block text-gray-800 mb-2 font-semibold mt-2">Number of Days</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={leaveDays}
                onChange={e => setLeaveDays(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-6"
              />
              <label className="block text-gray-800 mb-2 font-semibold mt-2">Start Date</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={e => setLeaveStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-6"
              />
              <label className="block text-gray-800 mb-2 font-semibold mt-2">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={e => setLeaveEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-6"
              />
              <label className="block text-gray-800 mb-2 font-semibold mt-2">Remarks</label>
              <textarea
                value={leaveRemarks}
                onChange={e => setLeaveRemarks(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-6"
                placeholder="Enter remarks (optional)"
              />
              <div className="flex-grow" />
              <div className="flex gap-6 mb-8 justify-center">
                <button
                  className="px-6 py-2 rounded-lg backdrop-blur-md bg-white/30 border border-white/40 shadow-md text-gray-900 hover:bg-white/50 transition font-semibold"
                  onClick={() => setShowLeaveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-lg backdrop-blur-md bg-blue-400/30 border border-blue-200/40 shadow-md text-blue-900 font-semibold hover:bg-blue-400/50 hover:text-white transition"
                  onClick={async () => {
                    if (!leaveReason || !leaveDays || !leaveStartDate || !leaveEndDate) return;
                    const selectedType = leaveTypes.find(t => t.value === leaveReason);
                    const leave_type_id = selectedType ? selectedType.id : null;
                    try {
                      const res = await fetch('http://localhost:5000/api/leaves', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: userId,
                          start_date: leaveStartDate,
                          end_date: leaveEndDate,
                          reason: leaveReason,
                          days: leaveDays,
                          remarks: leaveRemarks,
                          leave_type_id
                        })
                      });
                      if (res.ok) {
                        setLeaveMsg('Leave applied successfully!');
                      } else {
                        setLeaveMsg('Failed to apply for leave.');
                      }
                    } catch {
                      setLeaveMsg('Failed to apply for leave.');
                    }
                    setShowLeaveModal(false);
                    setTimeout(() => setLeaveMsg(''), 1500);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Time-Off Modal */}
        {showTimeOff && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-40 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center min-h-[60vh]">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
                onClick={() => setShowTimeOff(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <TimeOffForm userId={userId} onSuccess={() => setShowTimeOff(false)} />
            </div>
          </div>
        )}
        <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center drop-shadow">Diary Entry</h2>
        {isHoliday && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 font-semibold rounded">
            Today is a holiday for you. No diary entry required.
          </div>
        )}
        {isPublicHoliday && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 font-semibold rounded">
            Today is a public holiday. Diary entry is not allowed.
          </div>
        )}
        <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg rounded-2xl p-8 w-full mb-4" style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}>
          <form onSubmit={handleSubmit} className="w-full" style={{ opacity: isHoliday || isPublicHoliday ? 0.5 : 1, pointerEvents: isHoliday || isPublicHoliday ? 'none' : 'auto' }}>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Course</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.course ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select a course</option>
                {(Array.isArray(courses) ? courses : []).map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.semester ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select semester</option>
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={`Semester ${num}`}>{`Semester ${num}`}</option>
                ))}
              </select>
              {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Lecture/Class</label>
              <select
                name="lecture"
                value={form.lecture}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.lecture ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select lecture/class</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={`Lecture ${i+1}`}>{`Lecture ${i+1}`}</option>
                ))}
              </select>
              {errors.lecture && <p className="text-red-500 text-sm mt-1">{errors.lecture}</p>}
            </div>
            <div className="mb-4 flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-800 mb-2 font-semibold">Start Time</label>
                <select
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.startTime ? 'ring-2 ring-red-400' : ''}`}
                >
                  <option value="">Select start time</option>
                  {allowedTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-gray-800 mb-2 font-semibold">End Time</label>
                <select
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.endTime ? 'ring-2 ring-red-400' : ''}`}
                >
                  <option value="">Select end time</option>
                  {allowedTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.date ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.subject ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Topic/Unit Covered</label>
              <select
                name="topic"
                value={form.topic}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.topic ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Subtopic/Unit/Chapter</label>
              <select
                name="subtopic"
                value={form.subtopic || ''}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.subtopic ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select subtopic</option>
                {subtopics.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              {errors.subtopic && <p className="text-red-500 text-sm mt-1">{errors.subtopic}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-800 mb-2 font-semibold">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner"
                placeholder="Homework, instructions, etc."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl border border-white/30 bg-white/20 text-blue-700 font-bold shadow-lg backdrop-blur-xl hover:bg-white/40 hover:text-blue-900 transition"
              style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}
            >
              Submit
            </button>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-white/30 bg-white/20 text-blue-700 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/40 hover:text-blue-900 transition"
                style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 