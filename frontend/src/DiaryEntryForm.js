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
  const [showTimeOff, setShowTimeOff] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Adjust as per your auth logic
    localStorage.removeItem('user'); // Remove persisted user
    navigate('/login');
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => setCourses([]));
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

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-2xl p-10 w-full max-w-lg relative flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        {userName && (
          <div className="w-full flex justify-start items-center mb-2">
            <span className="text-lg font-semibold text-blue-800">Welcome, {userName}!</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-6 w-full backdrop-blur-2xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-5" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(255,255,255,0.12)'}}>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-white/30 bg-white/20 text-red-600 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/40 hover:text-red-700 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(255, 0, 0, 0.10)'}}
          >
            Logout
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-white/30 bg-white/20 text-blue-700 font-semibold shadow-lg backdrop-blur-xl hover:bg-white/40 hover:text-blue-900 transition"
            style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}
            onClick={() => setShowTimeOff(true)}
          >
            + Add Time-Off
          </button>
        </div>
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
        <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg rounded-2xl p-8 w-full mb-4" style={{boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'}}>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-semibold">Course</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.course ? 'ring-2 ring-red-400' : ''}`}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
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
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.startTime ? 'ring-2 ring-red-400' : ''}`}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-gray-800 mb-2 font-semibold">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-none rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-400 shadow-inner ${errors.endTime ? 'ring-2 ring-red-400' : ''}`}
                />
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