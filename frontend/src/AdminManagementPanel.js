import React, { useEffect, useState } from 'react';
import TimeOffForm from './TimeOffForm';
import PublicHolidaysPanel from './PublicHolidaysPanel';
import LeaveApprovalDashboard from './LeaveApprovalDashboard';
import ExcelJS from 'exceljs';

const TABS = [
  { key: 'teachers', label: 'Teachers' },
  { key: 'courses', label: 'Courses' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'topics', label: 'Topics' },
  { key: 'holidays', label: 'Public Holidays' },
  { key: 'leaves', label: 'Leaves' },
];

function EditTeacherModal({ teacher, onClose, onSubmit }) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
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
    </div>
  );
}

function ConfirmDeleteModal({ teacher, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-red-700 mb-6">Delete Teacher</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-bold">{teacher.name}</span>?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl border border-red-500 bg-red-600 text-white font-semibold shadow hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function AddTeacherModal({ onClose, onSubmit, courses }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', courseIds: [], pDay: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCourseCheckbox = id => {
    setForm(f => {
      const exists = f.courseIds.includes(id);
      return {
        ...f,
        courseIds: exists ? f.courseIds.filter(cid => cid !== id) : [...f.courseIds, id]
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!form.mobile) errs.mobile = 'Mobile is required';
    if (!form.password) errs.password = 'Password is required';
    if (!form.courseIds || form.courseIds.length === 0) errs.courseIds = 'At least one course is required';
    if (!form.pDay) errs.pDay = 'P-Day is required';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Convert courseIds to array of numbers and pDay to integer
      const payload = {
        ...form,
        courseIds: form.courseIds.map(cid => Number(cid)),
        pDay: parseInt(form.pDay, 10)
      };
      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Add Teacher</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">Mobile</label>
            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">Courses</label>
            <div className="max-h-32 overflow-y-auto border border-blue-200 rounded-xl bg-white/80 p-2 shadow-inner">
              {courses && courses.map(c => (
                <div key={c.id} className="flex items-center mb-1 hover:bg-blue-50 rounded px-2 transition">
                  <input
                    type="checkbox"
                    checked={form.courseIds.includes(String(c.id)) || form.courseIds.includes(c.id)}
                    onChange={() => handleCourseCheckbox(String(c.id))}
                    id={`course_${c.id}`}
                    className="accent-blue-600 scale-110"
                  />
                  <label htmlFor={`course_${c.id}`} className="ml-2 text-blue-900 cursor-pointer text-sm">{c.name}</label>
                </div>
              ))}
            </div>
            {errors.courseIds && <p className="text-red-500 text-sm mt-1">{errors.courseIds}</p>}
          </div>
          <div className="mb-3">
            <label className="block text-gray-800 mb-1 font-semibold">P-Day</label>
            <input type="number" name="pDay" value={form.pDay} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" min="0" />
            {errors.pDay && <p className="text-red-500 text-sm mt-1">{errors.pDay}</p>}
          </div>
          <button type="submit" className="w-full py-2 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Add Teacher</button>
        </form>
      </div>
    </div>
  );
}

function EditCourseModal({ course, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...course });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.code) errs.code = 'Code is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Edit Course</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Code</label>
            <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Update Course</button>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteCourseModal({ course, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-red-700 mb-6">Delete Course</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-bold">{course.name}</span>?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl border border-red-500 bg-red-600 text-white font-semibold shadow hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function AddCourseModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', code: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.code) errs.code = 'Code is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add Course</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Code</label>
            <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Add Course</button>
        </form>
      </div>
    </div>
  );
}

function AssignCoursesModal({ teacher, onClose, onSubmit }) {
  const [coursesWithSubjects, setCoursesWithSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // [{course_id, subject_id}]
  const [selectedCourses, setSelectedCourses] = useState([]); // [course_id]
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const courses = await coursesRes.json();
      const coursesWithSubs = await Promise.all(courses.map(async (course) => {
        const subsRes = await fetch(`http://localhost:5000/api/subjects?course_id=${course.id}`);
        const subjects = await subsRes.json();
        return { ...course, subjects };
      }));
      setCoursesWithSubjects(coursesWithSubs);
      // Fetch assigned subjects for this teacher
      const assignedRes = await fetch(`http://localhost:5000/api/teacher-subjects?teacher_id=${teacher.id}`);
      const assignedList = await assignedRes.json();
      setSelectedSubjects(assignedList.map(a => ({ course_id: a.course_id, subject_id: a.subject_id })));
      // Fetch assigned courses for this teacher
      const assignedCoursesRes = await fetch(`http://localhost:5000/api/teacher-courses?teacher_id=${teacher.id}`);
      const assignedCourses = await assignedCoursesRes.json();
      setSelectedCourses(assignedCourses.map(cid => String(cid)));
      setLoading(false);
    }
    fetchData();
  }, [teacher.id]);

  const isSubjectChecked = (course_id, subject_id) => selectedSubjects.some(sel => sel.course_id === course_id && sel.subject_id === subject_id);
  const isCourseChecked = (course_id) => selectedCourses.includes(String(course_id));

  const handleCourseToggle = (course_id) => {
    setSelectedCourses(prev =>
      isCourseChecked(course_id)
        ? prev.filter(cid => cid !== String(course_id))
        : [...prev, String(course_id)]
    );
  };

  const handleSubjectToggle = (course_id, subject_id) => {
    setSelectedSubjects(sel =>
      isSubjectChecked(course_id, subject_id)
        ? sel.filter(s => !(s.course_id === course_id && s.subject_id === subject_id))
        : [...sel, { course_id, subject_id }]
    );
    // When a subject is checked, ensure the course is also checked
    if (!isCourseChecked(course_id)) {
      setSelectedCourses(prev => [...prev, String(course_id)]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Ensure all courses with at least one subject checked are included in selectedCourses
    const allCourseIds = Array.from(new Set([
      ...selectedCourses,
      ...selectedSubjects.map(s => String(s.course_id))
    ]));
    await onSubmit({
      course_ids: allCourseIds,
      subject_assignments: selectedSubjects
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Assign Courses & Subjects to {teacher.name}</h2>
        {loading ? (
          <div className="text-blue-700 font-semibold py-8">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-6 max-h-[60vh] overflow-y-auto space-y-6">
              {coursesWithSubjects.length === 0 ? (
                <p className="text-gray-500">No courses available.</p>
              ) : (
                coursesWithSubjects.map(course => (
                  <div key={course.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isCourseChecked(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        className="accent-blue-600 scale-110 mr-2"
                        id={`course_head_${course.id}`}
                      />
                      <label htmlFor={`course_head_${course.id}`}>{course.name}</label>
                      <span className="text-xs text-gray-500 font-normal">{course.code}</span>
                    </div>
                    {course.subjects.length === 0 ? (
                      <div className="text-gray-400 ml-4">No subjects</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {course.subjects.map(subject => (
                          <label
                            key={subject.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition
                              ${isSubjectChecked(course.id, subject.id)
                                ? 'bg-blue-100 border border-blue-400'
                                : 'bg-white border border-gray-200 hover:bg-blue-50'}
                            `}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              checked={isSubjectChecked(course.id, subject.id)}
                              onChange={() => handleSubjectToggle(course.id, subject.id)}
                              className="accent-blue-600"
                            />
                            <span className="font-medium text-blue-800">{subject.name}</span>
                            <span className="text-xs text-gray-500 ml-1">(ID: {subject.id})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/90 text-white font-bold shadow-lg hover:bg-blue-700/90 transition mt-2"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Assign Courses & Subjects'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function EditSubjectModal({ subject, allCourses, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...subject });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.course_id) errs.course_id = 'Course is required';
    if (!form.semester) errs.semester = 'Semester is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Edit Subject</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Course</label>
            <select name="course_id" value={form.course_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select course</option>
              {allCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Semester</label>
            <select name="semester" value={form.semester} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select semester</option>
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={`Semester ${num}`}>{`Semester ${num}`}</option>
              ))}
            </select>
            {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Update Subject</button>
        </form>
      </div>
    </div>
  );
}

function AddSubjectModal({ allCourses, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', course_id: '', semester: '' });
  const [errors, setErrors] = useState({});
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.course_id) errs.course_id = 'Course is required';
    if (!form.semester) errs.semester = 'Semester is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add Subject</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Course</label>
            <select name="course_id" value={form.course_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select course</option>
              {allCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Semester</label>
            <select name="semester" value={form.semester} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select semester</option>
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={`Semester ${num}`}>{`Semester ${num}`}</option>
              ))}
            </select>
            {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Add Subject</button>
        </form>
      </div>
    </div>
  );
}

// Add Topic Modal
function AddTopicModal({ subjects, onClose, onSubmit }) {
  const [form, setForm] = React.useState({ name: '', subject_id: '' });
  const [errors, setErrors] = React.useState({});
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.subject_id) errs.subject_id = 'Subject is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add Topic</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Subject</label>
            <select name="subject_id" value={form.subject_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Add Topic</button>
        </form>
      </div>
    </div>
  );
}

// Edit Topic Modal
function EditTopicModal({ topic, subjects, onClose, onSubmit }) {
  const [form, setForm] = React.useState({ ...topic });
  const [errors, setErrors] = React.useState({});
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.subject_id) errs.subject_id = 'Subject is required';
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Edit Topic</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-semibold">Subject</label>
            <select name="subject_id" value={form.subject_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner">
              <option value="">Select subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">Update Topic</button>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Topic Modal
function ConfirmDeleteTopicModal({ topic, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-red-700 mb-6">Delete Topic</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-bold">{topic.name}</span>?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl border border-red-500 bg-red-600 text-white font-semibold shadow hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Add subtopic modal component
function SubtopicModal({ topic, onClose }) {
  const [subtopics, setSubtopics] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editSubtopic, setEditSubtopic] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', description: '', order: '' });
  const [errors, setErrors] = React.useState({});
  const [deleteSubtopic, setDeleteSubtopic] = React.useState(null);

  React.useEffect(() => {
    if (!topic) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/subtopics?topic_id=${topic.id}`)
      .then(res => res.json())
      .then(data => {
        setSubtopics(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [topic]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    return errs;
  };
  const handleAdd = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = await fetch('http://localhost:5000/api/subtopics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        topic_id: topic.id,
        description: form.description,
        order: form.order || null
      })
    });
    if (res.ok) {
      setForm({ name: '', description: '', order: '' });
      setShowAdd(false);
      fetch(`http://localhost:5000/api/subtopics?topic_id=${topic.id}`)
        .then(res => res.json())
        .then(data => setSubtopics(Array.isArray(data) ? data : []));
      alert('Subtopic added successfully!');
    } else {
      alert('Failed to add subtopic');
    }
  };
  const handleEdit = sub => {
    setEditSubtopic(sub);
    setForm({ name: sub.name, description: sub.description, order: sub.order || '' });
    setShowAdd(false);
  };
  const handleUpdate = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = await fetch(`http://localhost:5000/api/subtopics/${editSubtopic.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        topic_id: topic.id,
        description: form.description,
        order: form.order || null
      })
    });
    if (res.ok) {
      setEditSubtopic(null);
      setForm({ name: '', description: '', order: '' });
      fetch(`http://localhost:5000/api/subtopics?topic_id=${topic.id}`)
        .then(res => res.json())
        .then(data => setSubtopics(Array.isArray(data) ? data : []));
      alert('Subtopic updated successfully!');
    } else {
      alert('Failed to update subtopic');
    }
  };
  const handleDelete = sub => {
    setDeleteSubtopic(sub);
  };
  const confirmDelete = async () => {
    if (!deleteSubtopic) return;
    const res = await fetch(`http://localhost:5000/api/subtopics/${deleteSubtopic.id}`, { method: 'DELETE' });
    if (res.ok) {
      fetch(`http://localhost:5000/api/subtopics?topic_id=${topic.id}`)
        .then(res => res.json())
        .then(data => setSubtopics(Array.isArray(data) ? data : []));
      alert('Subtopic deleted successfully!');
    } else {
      alert('Failed to delete subtopic');
    }
    setDeleteSubtopic(null);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Subtopics for: {topic.name}</h2>
        {loading ? <div className="text-blue-700 font-semibold py-8">Loading...</div> : (
          <>
            <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base mb-6">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {subtopics.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-400">No subtopics found.</td></tr>
                ) : (
                  subtopics.map(sub => (
                    <tr key={sub.id}>
                      <td className="px-4 py-2">{sub.name}</td>
                      <td className="px-4 py-2">{sub.description}</td>
                      <td className="px-4 py-2">{sub.order || '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700" onClick={() => handleEdit(sub)}>Edit</button>
                        <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700" onClick={() => handleDelete(sub)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {showAdd || editSubtopic ? (
              <form onSubmit={editSubtopic ? handleUpdate : handleAdd} className="w-full mb-4">
                <div className="mb-4">
                  <label className="block text-gray-800 mb-2 font-semibold">Subtopic Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-800 mb-2 font-semibold">Description</label>
                  <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-800 mb-2 font-semibold">Order</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition">{editSubtopic ? 'Update Subtopic' : 'Add Subtopic'}</button>
                <button type="button" className="w-full mt-2 py-3 rounded-xl border border-white/30 bg-gray-200 text-blue-700 font-bold shadow-lg hover:bg-gray-300 transition" onClick={() => { setEditSubtopic(null); setForm({ name: '', description: '', order: '' }); setShowAdd(false); }}>Cancel</button>
              </form>
            ) : (
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition mb-2" onClick={() => { setShowAdd(true); setEditSubtopic(null); setForm({ name: '', description: '', order: '' }); }}>+ Add Subtopic</button>
            )}
            {deleteSubtopic && (
              <ConfirmDeleteSubtopicModal subtopic={deleteSubtopic} onClose={() => setDeleteSubtopic(null)} onConfirm={confirmDelete} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Add ConfirmDeleteSubtopicModal component
function ConfirmDeleteSubtopicModal({ subtopic, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold text-red-700 mb-6">Delete Subtopic</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-bold">{subtopic.name}</span>?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl border border-red-500 bg-red-600 text-white font-semibold shadow hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagementPanel() {
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [editTeacher, setEditTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [assignCoursesTeacher, setAssignCoursesTeacher] = useState(null);
  const [assignCoursesModalOpen, setAssignCoursesModalOpen] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectCourses, setSubjectCourses] = useState([]);
  const [selectedSubjectCourse, setSelectedSubjectCourse] = useState('');
  const [selectedSubjectSemester, setSelectedSubjectSemester] = useState('');
  const [editSubject, setEditSubject] = useState(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [deleteSubject, setDeleteSubject] = useState(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicCourses, setTopicCourses] = useState([]);
  const [topicSubjects, setTopicSubjects] = useState([]);
  const [selectedTopicCourse, setSelectedTopicCourse] = useState('');
  const [selectedTopicSubject, setSelectedTopicSubject] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [deleteTopic, setDeleteTopic] = useState(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [subtopicModalTopic, setSubtopicModalTopic] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const filteredTeacherOptions = teacherOptions.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [adjustModal, setAdjustModal] = useState({ open: false, row: null });
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [showLeaveBalances, setShowLeaveBalances] = useState(false);
  const [historyModal, setHistoryModal] = useState({ open: false, row: null, data: [] });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearRange = 2;
  const years = [];
  for (let y = currentYear - yearRange; y <= currentYear + yearRange; y++) {
    years.push(y);
  }
  const [leaves, setLeaves] = useState([]);
  const [leavesRefreshKey, setLeavesRefreshKey] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetch('http://localhost:5000/api/teachers')
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setTeachers(arr);
          setFilteredTeachers(arr);
        })
        .catch(() => {
          setTeachers([]);
          setFilteredTeachers([]);
        });
      // Fetch courses for Add Teacher modal
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []))
        .catch(() => setCourses([]));
    }
    if (activeTab === 'courses') {
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []))
        .catch(() => setCourses([]));
    }
    if (activeTab === 'subjects') {
      // Fetch all courses for filter dropdown
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setSubjectCourses(Array.isArray(data) ? data : []));
      // Fetch all subjects (optionally filtered)
      let url = 'http://localhost:5000/api/subjects';
      const params = [];
      if (selectedSubjectCourse) params.push(`course_id=${selectedSubjectCourse}`);
      if (selectedSubjectSemester) params.push(`semester=${encodeURIComponent(selectedSubjectSemester)}`);
      if (params.length > 0) url += '?' + params.join('&');
      fetch(url)
        .then(res => res.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []));
    }
    if (activeTab === 'topics') {
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setTopicCourses(Array.isArray(data) ? data : []));
      // Fetch subjects for dropdown based on selected course
      if (selectedTopicCourse) {
        fetch(`http://localhost:5000/api/subjects?course_id=${selectedTopicCourse}`)
          .then(res => res.json())
          .then(data => setTopicSubjects(Array.isArray(data) ? data : []));
      } else {
        fetch('http://localhost:5000/api/subjects')
          .then(res => res.json())
          .then(data => setTopicSubjects(Array.isArray(data) ? data : []));
      }
      // Fetch topics
      if (selectedTopicSubject) {
        // Find the subject info for the selected subject
        fetch(`http://localhost:5000/api/subjects`)
          .then(res => res.json())
          .then(async allSubjects => {
            const subject = allSubjects.find(s => s.id === Number(selectedTopicSubject));
            if (!subject) {
              setTopics([]);
              return;
            }
            // Fetch topics for this subject and join with subject, course, and semester info
            const res = await fetch(`http://localhost:5000/api/topics?subject_id=${selectedTopicSubject}`);
            const topics = await res.json();
            setTopics(topics.map(t => ({
              ...t,
              subject_id: subject.id,
              subject_name: subject.name,
              course_id: subject.course_id,
              semester: subject.semester
            })));
          });
      } else {
        // Fetch all topics for all subjects, and join with subject, course, and semester info
        const fetchSubjects = selectedTopicCourse
          ? fetch(`http://localhost:5000/api/subjects?course_id=${selectedTopicCourse}`)
          : fetch('http://localhost:5000/api/subjects');
        fetchSubjects
          .then(res => res.json())
          .then(async subjects => {
            if (!Array.isArray(subjects) || subjects.length === 0) {
              setTopics([]);
              return;
            }
            // Fetch topics for each subject and flatten, joining with subject, course, and semester
            const allTopics = (await Promise.all(subjects.map(async s => {
              const res = await fetch(`http://localhost:5000/api/topics?subject_id=${s.id}`);
              const topics = await res.json();
              return topics.map(t => ({
                ...t,
                subject_id: s.id,
                subject_name: s.name,
                course_id: s.course_id,
                semester: s.semester
              }));
            }))).flat();
            setTopics(allTopics);
          });
      }
    }
    // Fetch all teachers/users for mapping user_id to name
    fetch('http://localhost:5000/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(u => { map[u.id] = u.name; });
          
        }
      });
    // Fetch leave balances for admin
    if (user?.role === 'admin') {
      fetch(`http://localhost:5000/api/leave-balances?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => setLeaveBalances(Array.isArray(data) ? data : []));
      // Fetch all leave types
      fetch('http://localhost:5000/api/leave-types')
        .then(res => res.json())
        .then(data => setLeaveTypes(Array.isArray(data) ? data : []));
    }
  }, [activeTab, selectedSubjectCourse, selectedSubjectSemester, selectedTopicCourse, selectedTopicSubject]);

  useEffect(() => {
    // Fetch all teachers for the dropdown
    fetch('http://localhost:5000/api/teachers')
      .then(res => res.json())
      .then(data => setTeacherOptions(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    // Fetch leave balances for selected teacher or admin
    const userIdToFetch = selectedTeacher ? selectedTeacher.id : user.id;
    if (user?.role === 'admin') {
      fetch(`http://localhost:5000/api/leave-balances?user_id=${userIdToFetch}&year=${selectedYear}`)
        .then(res => res.json())
        .then(data => setLeaveBalances(Array.isArray(data) ? data : []));
      fetch('http://localhost:5000/api/leave-types')
        .then(res => res.json())
        .then(data => setLeaveTypes(Array.isArray(data) ? data : []));
    }
  }, [activeTab, selectedTeacher, selectedYear]);

  // Filter teachers as the user types
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredTeachers(teachers);
      return;
    }
    setFilteredTeachers(
      teachers.filter(t => t.name.toLowerCase().includes(term))
    );
  }, [searchTerm, teachers]);

  const handleSearch = () => {
    // For accessibility: focus/clicking Search also triggers filter
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredTeachers(teachers);
      return;
    }
    setFilteredTeachers(
      teachers.filter(t => t.name.toLowerCase().includes(term))
    );
  };

  const handleEditTeacher = async (form) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Teacher updated successfully!');
      setEditTeacher(null);
      setIsEditing(false);
      // Refresh teachers list
      fetch('http://localhost:5000/api/teachers')
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setTeachers(arr);
          setFilteredTeachers(arr);
        });
    } else {
      alert('Failed to update teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Teacher deleted successfully!');
      setDeleteTeacher(null);
      setIsDeleting(false);
      // Refresh teachers list
      fetch('http://localhost:5000/api/teachers')
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setTeachers(arr);
          setFilteredTeachers(arr);
        });
    } else {
      alert('Failed to delete teacher');
    }
  };

  const handleToggleActive = async (teacher) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${teacher.id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: teacher.active ? 0 : 1 }),
    });
    if (res.ok) {
      alert('Teacher status updated');
      // Refresh teachers list
      fetch('http://localhost:5000/api/teachers')
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setTeachers(arr);
          setFilteredTeachers(arr);
        });
    } else {
      alert('Failed to update status');
    }
  };

  const handleAddTeacher = async (form) => {
    try {
      const res = await fetch('http://localhost:5000/api/add-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Teacher added successfully!');
        setShowAddTeacher(false);
        // Refresh teachers list
        fetch('http://localhost:5000/api/teachers')
          .then(res => res.json())
          .then(data => {
            const arr = Array.isArray(data) ? data : [];
            setTeachers(arr);
            setFilteredTeachers(arr);
          });
      } else {
        alert('Failed to add teacher');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const handleEditCourse = async (form) => {
    const res = await fetch(`http://localhost:5000/api/courses/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Course updated successfully!');
      setEditCourse(null);
      setIsEditingCourse(false);
      // Refresh courses list
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []));
    } else {
      alert('Failed to update course');
    }
  };

  const handleDeleteCourse = async (id) => {
    const res = await fetch(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Course deleted successfully!');
      setDeleteCourse(null);
      setIsDeletingCourse(false);
      // Refresh courses list
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []));
    } else {
      alert('Failed to delete course');
    }
  };

  const handleAddCourse = async (form) => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Course added successfully!');
        setShowAddCourse(false);
        // Refresh courses list
        fetch('http://localhost:5000/api/courses')
          .then(res => res.json())
          .then(data => setCourses(Array.isArray(data) ? data : []));
      } else {
        alert('Failed to add course');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const openAssignCoursesModal = (teacher) => {
    setAssignCoursesTeacher(teacher);
    setAssignCoursesModalOpen(true);
  };

  const handleAssignCourses = async ({ course_ids, subject_assignments }) => {
    const res = await fetch('http://localhost:5000/api/teacher-courses/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_id: assignCoursesTeacher.id,
        course_ids,
        subject_assignments
      }),
    });
    const data = await res.json();
    setAssignCoursesModalOpen(false);
    setAssignCoursesTeacher(null);
    if (res.ok) {
      alert('Courses and subjects assigned successfully!');
    } else {
      alert(data.message || 'Failed to assign courses/subjects');
    }
  };

  const handleEditSubject = async (form) => {
    const res = await fetch(`http://localhost:5000/api/subjects/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Subject updated successfully!');
      setEditSubject(null);
      setIsEditingSubject(false);
      // Refresh subjects list
      let url = 'http://localhost:5000/api/subjects';
      const params = [];
      if (selectedSubjectCourse) params.push(`course_id=${selectedSubjectCourse}`);
      if (selectedSubjectSemester) params.push(`semester=${encodeURIComponent(selectedSubjectSemester)}`);
      if (params.length > 0) url += '?' + params.join('&');
      fetch(url)
        .then(res => res.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []));
    } else {
      alert('Failed to update subject');
    }
  };

  const handleAddSubject = async (form) => {
    // POST to backend
    const res = await fetch('http://localhost:5000/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowAddSubject(false);
      // Refresh subjects list
      let url = 'http://localhost:5000/api/subjects';
      const params = [];
      if (selectedSubjectCourse) params.push(`course_id=${selectedSubjectCourse}`);
      if (selectedSubjectSemester) params.push(`semester=${encodeURIComponent(selectedSubjectSemester)}`);
      if (params.length > 0) url += '?' + params.join('&');
      fetch(url)
        .then(res => res.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []));
      alert('Subject added successfully!');
    } else {
      alert('Failed to add subject');
    }
  };

  const handleDeleteSubject = (subject) => {
    setDeleteSubject(subject);
    setIsDeletingSubject(true);
  };

  const confirmDeleteSubject = async () => {
    if (!deleteSubject) return;
    const res = await fetch(`http://localhost:5000/api/subjects/${deleteSubject.id}`, { method: 'DELETE' });
    if (res.ok) {
      // Refresh subjects list
      let url = 'http://localhost:5000/api/subjects';
      const params = [];
      if (selectedSubjectCourse) params.push(`course_id=${selectedSubjectCourse}`);
      if (selectedSubjectSemester) params.push(`semester=${encodeURIComponent(selectedSubjectSemester)}`);
      if (params.length > 0) url += '?' + params.join('&');
      fetch(url)
        .then(res => res.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []));
    } else {
      alert('Failed to delete subject');
    }
    setDeleteSubject(null);
    setIsDeletingSubject(false);
  };

  const handleAddTopic = async (form) => {
    const res = await fetch('http://localhost:5000/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Topic added successfully!');
      setShowAddTopic(false);
      if (selectedTopicSubject) {
        fetch(`http://localhost:5000/api/topics?subject_id=${selectedTopicSubject}`)
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } else {
      alert('Failed to add topic');
    }
  };
  const handleEditTopic = async (form) => {
    // Only send name and subject_id to backend
    const payload = {
      name: form.name,
      subject_id: form.subject_id
    };
    const res = await fetch(`http://localhost:5000/api/topics/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert('Topic updated successfully!');
      setEditTopic(null);
      setIsEditingTopic(false);
      if (selectedTopicSubject) {
        fetch(`http://localhost:5000/api/topics?subject_id=${selectedTopicSubject}`)
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } else {
      alert('Failed to update topic');
    }
  };
  const handleDeleteTopic = (topic) => {
    setDeleteTopic(topic);
    setIsDeletingTopic(true);
  };
  const confirmDeleteTopic = async () => {
    if (!deleteTopic) return;
    const res = await fetch(`http://localhost:5000/api/topics/${deleteTopic.id}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedTopicSubject) {
        fetch(`http://localhost:5000/api/topics?subject_id=${selectedTopicSubject}`)
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } else {
      alert('Failed to delete topic');
    }
    setDeleteTopic(null);
    setIsDeletingTopic(false);
  };

  // Merge leave types with balances so all types are shown, but exclude 'Other'
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

  // Add this useEffect to sync selectedTeacher with teacherSearch
  useEffect(() => {
    if (!teacherSearch) {
      setSelectedTeacher(null);
      return;
    }
    const match = teacherOptions.find(t => t.name === teacherSearch);
    if (!match) {
      setSelectedTeacher(null);
    }
  }, [teacherSearch, teacherOptions]);

  const handleExportLeaveBalances = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Leave Balances');
    sheet.addRow(['Type', 'Opening', 'Used', 'Adjustments', 'Available']);
    mergedBalances.forEach(b => {
      sheet.addRow([
        b.leave_type_name,
        b.opening_balance,
        b.used,
        b.adjustments,
        b.available
      ]);
    });
    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTeacher ? selectedTeacher.name + '-' : ''}Leave-Balances.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdjust = async () => {
    setAdjustLoading(true);
    setAdjustError('');
    const userId = selectedTeacher ? selectedTeacher.id : user.id;
    const year = new Date().getFullYear();
    const leaveTypeId = leaveTypes.find(t => t.name === adjustModal.row.leave_type_name)?.leave_type_id;
    if (!leaveTypeId) {
      setAdjustError('Leave type not found');
      setAdjustLoading(false);
      return;
    }
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt === 0) {
      setAdjustError('Enter a non-zero adjustment amount');
      setAdjustLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/leave-balances/adjust', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          leave_type_id: leaveTypeId,
          year,
          adjustment: amt,
          reason: adjustReason,
          adjusted_by: user.id
        })
      });
      if (res.ok) {
        setAdjustModal({ open: false, row: null });
        setAdjustAmount('');
        setAdjustReason('');
        setAdjustError('');
        // Refresh balances
        fetch(`http://localhost:5000/api/leave-balances?user_id=${userId}`)
          .then(res => res.json())
          .then(data => setLeaveBalances(Array.isArray(data) ? data : []));
      } else {
        const data = await res.json();
        setAdjustError(data.message || 'Failed to adjust');
      }
    } catch (err) {
      setAdjustError('Network error');
    }
    setAdjustLoading(false);
  };

  const handleHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');
    const userId = selectedTeacher ? selectedTeacher.id : user.id;
    const teacherName = selectedTeacher ? selectedTeacher.name : user.name;
    const year = new Date().getFullYear();
    const leaveTypeId = leaveTypes.find(t => t.name === historyModal.row.leave_type_name)?.leave_type_id;
    try {
      const res = await fetch(`http://localhost:5000/api/leave-balances/adjustments?user_id=${userId}&leave_type_id=${leaveTypeId}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryModal({ open: true, row: { ...historyModal.row, teacherName }, data });
      } else {
        setHistoryError('Failed to fetch history');
      }
    } catch (err) {
      setHistoryError('Network error');
    }
    setHistoryLoading(false);
  };

  // Calculate analytics for leave records
  const leaveTypeCounts = {};
  let totalLeaves = 0;
  if (Array.isArray(leaves)) {
    leaves.forEach(l => {
      if (!leaveTypeCounts[l.reason]) leaveTypeCounts[l.reason] = 0;
      leaveTypeCounts[l.reason] += parseFloat(l.days || 1);
      totalLeaves += parseFloat(l.days || 1);
    });
  }
  const leaveTypesToShow = [
    'Casual Leave (CL)',
    'Sick Leave (SL)',
    'Earned Leave (EL)',
    'Leave Without Pay (LWP)',
    'Maternity Leave (ML)'
  ];

  // Fetch leave records for analytics when Leaves tab is active or leavesRefreshKey changes
  useEffect(() => {
    if (activeTab === 'leaves' && user?.role === 'admin') {
      let url = 'http://localhost:5000/api/leaves';
      const params = [];
      if (selectedTeacher) params.push(`user_id=${selectedTeacher.id}`);
      if (selectedYear) params.push(`year=${selectedYear}`);
      if (params.length > 0) url += '?' + params.join('&');
      fetch(url)
        .then(res => res.json())
        .then(data => setLeaves(Array.isArray(data) ? data : []));
    }
  }, [activeTab, selectedTeacher, selectedYear, leavesRefreshKey]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/60 shadow-lg p-6 flex flex-col gap-6 border-r border-white/40 min-h-screen">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8 text-center drop-shadow">Admin Management</h1>
        <nav className="flex flex-col gap-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition text-left ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-blue-800 hover:bg-blue-100'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col gap-8">
        {activeTab === 'leaves' && user?.role === 'admin' && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center relative">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition mb-4"
              onClick={() => setShowLeaveBalances(v => !v)}
            >
              Leave Balances
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition mb-4"
              onClick={() => setShowAnalytics(v => !v)}
            >
              Analytics
            </button>
          </div>
        )}
        {activeTab === 'leaves' && user?.role === 'admin' && showLeaveBalances && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 shadow">
            <div className="flex flex-col sm:flex-row gap-4 items-center relative mb-4">
              <label className="font-semibold text-blue-700">Search Teacher:</label>
              <input
                type="text"
                value={teacherSearch}
                onChange={e => {
                  setTeacherSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Type to search..."
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 220 }}
              />
              {showSuggestions && teacherSearch && (
                <ul className="absolute top-14 left-32 z-10 bg-white border border-blue-200 rounded-lg shadow-lg w-[220px] max-h-60 overflow-y-auto">
                  {teacherOptions
                    .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                    .map(t => (
                      <li
                        key={t.id}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-blue-900"
                        onMouseDown={() => {
                          setSelectedTeacher(t);
                          setTeacherSearch(t.name);
                          setShowSuggestions(false);
                        }}
                      >
                        {t.name}
                      </li>
                    ))}
                  {teacherOptions.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                    <li className="px-4 py-2 text-gray-400">No teachers found</li>
                  )}
                </ul>
              )}
              {/* Year dropdown */}
              <label className="font-semibold text-blue-700 ml-4">Year:</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 120 }}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <h3 className="font-semibold text-blue-700 mb-2">{selectedTeacher ? `${selectedTeacher.name}'s` : 'Your'} Leave Balances ({new Date().getFullYear()})</h3>
            <table className="min-w-full divide-y divide-gray-200 mb-2">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Opening</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Used</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Adjustments</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Available</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
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
                    <td className="px-4 py-2">
                      <button
                        className="px-3 py-1 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 text-xs shadow mr-2"
                        onClick={() => {
                          setAdjustModal({ open: true, row: b });
                          setAdjustAmount('');
                          setAdjustReason('');
                          setAdjustError('');
                        }}
                      >
                        Adjust
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 text-xs shadow"
                        onClick={async () => {
                          setHistoryModal({ open: true, row: b, data: [] });
                          setHistoryLoading(true);
                          setHistoryError('');
                          const userId = selectedTeacher ? selectedTeacher.id : user.id;
                          const teacherName = selectedTeacher ? selectedTeacher.name : user.name;
                          const leaveTypeId = leaveTypes.find(t => t.name === b.leave_type_name)?.leave_type_id;
                          try {
                            const res = await fetch(`http://localhost:5000/api/leave-balances/adjustments?user_id=${userId}&leave_type_id=${leaveTypeId}&year=${selectedYear}`);
                            if (res.ok) {
                              const data = await res.json();
                              setHistoryModal({ open: true, row: { ...b, teacherName }, data });
                            } else {
                              setHistoryError('Failed to fetch history');
                            }
                          } catch (err) {
                            setHistoryError('Network error');
                          }
                          setHistoryLoading(false);
                        }}
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {adjustModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={() => setAdjustModal({ open: false, row: null })} aria-label="Close">&times;</button>
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Adjust {adjustModal.row.leave_type_name}</h2>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    placeholder="Adjustment amount (e.g. 2 or -1)"
                    className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-4"
                  />
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="w-full px-4 py-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-inner mb-4"
                  />
                  {adjustError && <div className="text-red-600 mb-2">{adjustError}</div>}
                  <div className="flex gap-4 mt-2">
                    <button
                      className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition"
                      disabled={adjustLoading}
                      onClick={handleAdjust}
                    >
                      Apply
                    </button>
                    <button
                      className="px-6 py-2 rounded-xl bg-gray-200 text-blue-700 font-bold shadow hover:bg-gray-300 transition"
                      onClick={() => setAdjustModal({ open: false, row: null })}
                      disabled={adjustLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {historyModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full relative flex flex-col justify-center items-center">
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold" onClick={() => setHistoryModal({ open: false, row: null, data: [] })} aria-label="Close">&times;</button>
                  <h2 className="text-2xl font-bold text-blue-800 mb-2">Adjustment History: {historyModal.row?.leave_type_name}</h2>
                  <div className="mb-4 text-blue-700 font-semibold">Teacher: {historyModal.row?.teacherName || user.name}</div>
                  {historyLoading ? (
                    <div className="text-blue-700 font-semibold py-8">Loading...</div>
                  ) : historyError ? (
                    <div className="text-red-600 mb-4">{historyError}</div>
                  ) : historyModal.data.length === 0 ? (
                    <div className="text-gray-500 mb-4">No adjustment history found.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 mb-2">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {historyModal.data.map((h, idx) => (
                          <tr key={h.id || idx}>
                            <td className="px-4 py-2">{new Date(h.created_at).toLocaleString()}</td>
                            <td className="px-4 py-2 font-bold text-blue-800">{h.amount}</td>
                            <td className="px-4 py-2">{h.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'leaves' && user?.role === 'admin' && showAnalytics && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 shadow">
            <div className="w-full flex flex-wrap gap-4">
              {leaveTypesToShow.map(type => (
                <div
                  key={type}
                  className={`flex-1 min-w-[180px] bg-white/80 border border-blue-200 rounded-xl shadow p-4 flex flex-col items-center cursor-pointer transition-all duration-150 ${selectedAnalyticsType === type ? 'ring-4 ring-purple-400 border-purple-600' : 'hover:border-blue-400'}`}
                  onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === type ? null : type)}
                >
                  <div className="text-lg font-bold text-blue-700 mb-1">{type.replace(' (', '\n(')}</div>
                  <div className="text-3xl font-extrabold text-blue-900">{leaveTypeCounts[type] || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Days</div>
                </div>
              ))}
              <div
                className={`flex-1 min-w-[180px] bg-white/80 border border-blue-200 rounded-xl shadow p-4 flex flex-col items-center cursor-pointer transition-all duration-150 ${selectedAnalyticsType === 'Total' ? 'ring-4 ring-purple-400 border-purple-600' : 'hover:border-blue-400'}`}
                onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === 'Total' ? null : 'Total')}
              >
                <div className="text-lg font-bold text-blue-700 mb-1">Total Leaves</div>
                <div className="text-3xl font-extrabold text-blue-900">{totalLeaves}</div>
                <div className="text-xs text-gray-500 mt-1">All Types</div>
              </div>
            </div>
            {/* Details table for selected card, always below the cards */}
            {selectedAnalyticsType && (
              <div className="mt-6 bg-white/90 border border-blue-200 rounded-xl shadow p-4">
                <h3 className="text-lg font-bold text-blue-700 mb-4">
                  {selectedAnalyticsType === 'Total' ? 'All Leave Records' : `${selectedAnalyticsType} Records`}
                </h3>
                <table className="min-w-full divide-y divide-gray-200 mb-2">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Applicant</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">From</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">To</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Days</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(selectedAnalyticsType === 'Total'
                      ? leaves
                      : leaves.filter(l => l.reason === selectedAnalyticsType)
                    ).map((l, idx) => (
                      <tr key={l.id || idx}>
                        <td className="px-4 py-2">{l.applicant_name || l.name || '-'}</td>
                        <td className="px-4 py-2">{l.reason}</td>
                        <td className="px-4 py-2">{l.start_date || l.date}</td>
                        <td className="px-4 py-2">{l.end_date || '-'}</td>
                        <td className="px-4 py-2">{l.days}</td>
                        <td className="px-4 py-2">{l.status}</td>
                        <td className="px-4 py-2">{l.remarks || '-'}</td>
                      </tr>
                    ))}
                    {(selectedAnalyticsType === 'Total'
                      ? leaves.length === 0
                      : leaves.filter(l => l.reason === selectedAnalyticsType).length === 0
                    ) && (
                      <tr><td colSpan={7} className="text-center py-4 text-gray-400">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'teachers' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Manage Teachers</h2>
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowAddTeacher(true)}>+ Add Teacher</button>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-6 border border-blue-200">
              <div className="flex gap-2 items-center mb-6">
                <input
                  type="text"
                  placeholder="Search teacher by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ width: '320px' }}
                />
                <button
                  className="px-4 py-2 rounded-lg bg-blue-400 text-white font-semibold shadow hover:bg-blue-600 transition"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Mobile</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredTeachers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No teachers found.</td></tr>
                    ) : (
                      filteredTeachers.map(t => (
                        <tr key={t.id}>
                          <td className="px-4 py-2">{t.name}</td>
                          <td className="px-4 py-2">{t.email}</td>
                          <td className="px-4 py-2">{t.mobile}</td>
                          <td className={`px-4 py-2 font-semibold ${t.active ? 'text-green-700' : 'text-red-700'}`}>{t.active ? 'Active' : 'Inactive'}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700" onClick={() => { setEditTeacher(t); setIsEditing(true); }}>Edit</button>
                            <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700" onClick={() => { setDeleteTeacher(t); setIsDeleting(true); }}>Delete</button>
                            <button
                              className={`px-3 py-1 rounded font-semibold ${t.active ? 'bg-yellow-500 text-white hover:bg-yellow-700' : 'bg-green-500 text-white hover:bg-green-700'}`}
                              onClick={() => handleToggleActive(t)}
                            >
                              {t.active ? 'Make Inactive' : 'Make Active'}
                            </button>
                            <button className="px-3 py-1 rounded bg-blue-400 text-white font-semibold hover:bg-blue-700" onClick={() => openAssignCoursesModal(t)}>Assign Courses</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
        {activeTab === 'courses' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Manage Courses</h2>
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowAddCourse(true)}>+ Add Course</button>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-6 border border-blue-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {courses.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">No courses found.</td></tr>
                  ) : (
                    courses.map(c => (
                      <tr key={c.id}>
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2">{c.code || '-'}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700" onClick={() => { setEditCourse(c); setIsEditingCourse(true); }}>Edit</button>
                          <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700" onClick={() => { setDeleteCourse(c); setIsDeletingCourse(true); }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {activeTab === 'subjects' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Manage Subjects</h2>
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowAddSubject(true)}>+ Add Subject</button>
            </div>
            <div className="flex gap-4 mb-6 items-center">
              <label className="font-semibold text-blue-700">Course:</label>
              <select
                value={selectedSubjectCourse}
                onChange={e => setSelectedSubjectCourse(e.target.value)}
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Courses</option>
                {subjectCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="font-semibold text-blue-700 ml-4">Semester:</label>
              <select
                value={selectedSubjectSemester}
                onChange={e => setSelectedSubjectSemester(e.target.value)}
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={`Semester ${num}`}>{`Semester ${num}`}</option>
                ))}
              </select>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-6 border border-blue-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base mb-6">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {subjects.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-400">No subjects found.</td></tr>
                  ) : (
                    subjects.map(s => (
                      <tr key={s.id}>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{subjectCourses.find(c => c.id === s.course_id)?.name || '-'}</td>
                        <td className="px-4 py-2">{s.semester}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700" onClick={() => { setEditSubject(s); setIsEditingSubject(true); }}>Edit</button>
                          <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700" onClick={() => handleDeleteSubject(s)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {activeTab === 'topics' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Manage Topics</h2>
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowAddTopic(true)}>+ Add Topic</button>
            </div>
            <div className="flex gap-4 mb-6 items-center">
              <label className="font-semibold text-blue-700">Course:</label>
              <select
                value={selectedTopicCourse}
                onChange={e => { setSelectedTopicCourse(e.target.value); setSelectedTopicSubject(''); }}
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Courses</option>
                {topicCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="font-semibold text-blue-700 ml-4">Subject:</label>
              <select
                value={selectedTopicSubject}
                onChange={e => setSelectedTopicSubject(e.target.value)}
                className="px-3 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Subjects</option>
                {topicSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-6 border border-blue-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {topics.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">No topics found.</td></tr>
                  ) : (
                    topics.map(t => (
                      <tr key={t.id}>
                        <td className="px-4 py-2">{t.name}</td>
                        <td className="px-4 py-2">{t.subject_name || topicSubjects.find(s => s.id === t.subject_id)?.name || '-'}</td>
                        <td className="px-4 py-2">{topicCourses.find(c => c.id === t.course_id)?.name || '-'}</td>
                        <td className="px-4 py-2">{t.semester || '-'}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700" onClick={() => { setEditTopic(t); setIsEditingTopic(true); }}>Edit</button>
                          <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700" onClick={() => handleDeleteTopic(t)}>Delete</button>
                          <button className="px-3 py-1 rounded bg-purple-500 text-white font-semibold hover:bg-purple-700" onClick={() => setSubtopicModalTopic(t)}>Subtopics</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {activeTab === 'holidays' && (
          <section>
            <PublicHolidaysPanel />
          </section>
        )}
        {activeTab === 'leaves' && (
          <section>
            {/* Only show the approval dashboard for supervisors/HR in the Leaves tab */}
            <LeaveApprovalDashboard approverId={user.id} />
          </section>
        )}
      </main>
      {isEditing && editTeacher && (
        <EditTeacherModal
          teacher={editTeacher}
          onClose={() => { setEditTeacher(null); setIsEditing(false); }}
          onSubmit={handleEditTeacher}
        />
      )}
      {isDeleting && deleteTeacher && (
        <ConfirmDeleteModal
          teacher={deleteTeacher}
          onClose={() => { setDeleteTeacher(null); setIsDeleting(false); }}
          onConfirm={() => handleDeleteTeacher(deleteTeacher.id)}
        />
      )}
      {showAddTeacher && (
        <AddTeacherModal onClose={() => setShowAddTeacher(false)} onSubmit={handleAddTeacher} courses={courses} />
      )}
      {isEditingCourse && editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => { setEditCourse(null); setIsEditingCourse(false); }}
          onSubmit={handleEditCourse}
        />
      )}
      {isDeletingCourse && deleteCourse && (
        <ConfirmDeleteCourseModal
          course={deleteCourse}
          onClose={() => { setDeleteCourse(null); setIsDeletingCourse(false); }}
          onConfirm={() => handleDeleteCourse(deleteCourse.id)}
        />
      )}
      {showAddCourse && (
        <AddCourseModal onClose={() => setShowAddCourse(false)} onSubmit={handleAddCourse} />
      )}
      {assignCoursesModalOpen && assignCoursesTeacher && (
        <AssignCoursesModal
          teacher={assignCoursesTeacher}
          onClose={() => { setAssignCoursesModalOpen(false); setAssignCoursesTeacher(null); }}
          onSubmit={handleAssignCourses}
        />
      )}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl font-bold"
              onClick={() => setShowHolidayModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <TimeOffForm
              userId={assignCoursesTeacher?.id}
              teacherName={assignCoursesTeacher?.name}
              onSuccess={() => setShowHolidayModal(false)}
            />
          </div>
        </div>
      )}
      {isEditingSubject && editSubject && (
        <EditSubjectModal
          subject={editSubject}
          allCourses={subjectCourses}
          onClose={() => { setEditSubject(null); setIsEditingSubject(false); }}
          onSubmit={handleEditSubject}
        />
      )}
      {showAddSubject && (
        <AddSubjectModal
          allCourses={subjectCourses}
          onClose={() => setShowAddSubject(false)}
          onSubmit={handleAddSubject}
        />
      )}
      {isDeletingSubject && deleteSubject && (
        <ConfirmDeleteModal
          teacher={deleteSubject} // reuse modal, just pass subject object
          onClose={() => { setDeleteSubject(null); setIsDeletingSubject(false); }}
          onConfirm={confirmDeleteSubject}
        />
      )}
      {showAddTopic && (
        <AddTopicModal subjects={topicSubjects} onClose={() => setShowAddTopic(false)} onSubmit={handleAddTopic} />
      )}
      {isEditingTopic && editTopic && (
        <EditTopicModal topic={editTopic} subjects={topicSubjects} onClose={() => { setEditTopic(null); setIsEditingTopic(false); }} onSubmit={handleEditTopic} />
      )}
      {isDeletingTopic && deleteTopic && (
        <ConfirmDeleteTopicModal topic={deleteTopic} onClose={() => { setDeleteTopic(null); setIsDeletingTopic(false); }} onConfirm={confirmDeleteTopic} />
      )}
      {subtopicModalTopic && (
        <SubtopicModal topic={subtopicModalTopic} onClose={() => setSubtopicModalTopic(null)} />
      )}
    </div>
  );
}
