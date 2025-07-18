import React, { useEffect, useState } from 'react';
import TimeOffForm from './TimeOffForm';

const TABS = [
  { key: 'teachers', label: 'Teachers' },
  { key: 'courses', label: 'Courses' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'topics', label: 'Topics' },
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative flex flex-col justify-center items-center">
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

function AssignCoursesModal({ teacher, allCourses, assignedCourseIds, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]); // Only new assignments
  const [saving, setSaving] = useState(false);

  const handleToggle = (courseId) => {
    setSelected(sel => sel.includes(courseId)
      ? sel.filter(id => id !== courseId)
      : [...sel, courseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(selected);
    setSaving(false);
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
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Assign Courses to {teacher.name}</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6 max-h-64 overflow-y-auto">
            {allCourses.length === 0 ? (
              <p className="text-gray-500">No courses available.</p>
            ) : (
              allCourses.map(course => {
                const isAssigned = (assignedCourseIds || []).includes(course.id);
                return (
                  <label key={course.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAssigned || selected.includes(course.id)}
                      disabled={isAssigned}
                      onChange={() => {
                        if (!isAssigned) handleToggle(course.id);
                      }}
                    />
                    <span className={`font-semibold ${isAssigned ? 'text-gray-400' : 'text-blue-900'}`}>{course.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{course.code}</span>
                    {isAssigned && <span className="ml-2 text-xs text-green-600">(Already assigned)</span>}
                  </label>
                );
              })
            )}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl border border-white/30 bg-blue-600/80 text-white font-bold shadow-lg hover:bg-blue-700/90 transition" disabled={saving}>{saving ? 'Saving...' : 'Assign Courses'}</button>
        </form>
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
  const [assignCoursesAssigned, setAssignCoursesAssigned] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [holidayTeacher, setHolidayTeacher] = useState(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectCourses, setSubjectCourses] = useState([]);
  const [selectedSubjectCourse, setSelectedSubjectCourse] = useState('');
  const [selectedSubjectSemester, setSelectedSubjectSemester] = useState('');
  const [editSubject, setEditSubject] = useState(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);

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
  }, [activeTab, selectedSubjectCourse, selectedSubjectSemester]);

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
    const data = await res.json();
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
      alert(data.message || 'Failed to update teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${id}`, { method: 'DELETE' });
    const data = await res.json();
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
      alert(data.message || 'Failed to delete teacher');
    }
  };

  const handleToggleActive = async (teacher) => {
    const res = await fetch(`http://localhost:5000/api/teacher/${teacher.id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: teacher.active ? 0 : 1 }),
    });
    const data = await res.json();
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
      alert(data.message || 'Failed to update status');
    }
  };

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
        // Refresh teachers list
        fetch('http://localhost:5000/api/teachers')
          .then(res => res.json())
          .then(data => {
            const arr = Array.isArray(data) ? data : [];
            setTeachers(arr);
            setFilteredTeachers(arr);
          });
      } else {
        alert(data.message || 'Failed to add teacher');
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
    const data = await res.json();
    if (res.ok) {
      alert('Course updated successfully!');
      setEditCourse(null);
      setIsEditingCourse(false);
      // Refresh courses list
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []));
    } else {
      alert(data.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (id) => {
    const res = await fetch(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      alert('Course deleted successfully!');
      setDeleteCourse(null);
      setIsDeletingCourse(false);
      // Refresh courses list
      fetch('http://localhost:5000/api/courses')
        .then(res => res.json())
        .then(data => setCourses(Array.isArray(data) ? data : []));
    } else {
      alert(data.message || 'Failed to delete course');
    }
  };

  const handleAddCourse = async (form) => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Course added successfully!');
        setShowAddCourse(false);
        // Refresh courses list
        fetch('http://localhost:5000/api/courses')
          .then(res => res.json())
          .then(data => setCourses(Array.isArray(data) ? data : []));
      } else {
        alert(data.message || 'Failed to add course');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const openAssignCoursesModal = async (teacher) => {
    setAssignCoursesTeacher(teacher);
    setAssignCoursesModalOpen(true);
    // Fetch all courses
    const coursesRes = await fetch('http://localhost:5000/api/courses');
    const courses = await coursesRes.json();
    setAllCourses(Array.isArray(courses) ? courses : []);
    // Fetch assigned courses
    const assignedRes = await fetch(`http://localhost:5000/api/teacher-courses?teacher_id=${teacher.id}`);
    const assigned = await assignedRes.json();
    setAssignCoursesAssigned(Array.isArray(assigned) ? assigned : []);
  };

  const handleAssignCourses = async (selectedCourseIds) => {
    const res = await fetch('http://localhost:5000/api/teacher-courses/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_id: assignCoursesTeacher.id, course_ids: selectedCourseIds }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Courses assigned successfully!');
      setAssignCoursesModalOpen(false);
      setAssignCoursesTeacher(null);
      setAssignCoursesAssigned([]);
      // Optionally refresh teachers list
      fetch('http://localhost:5000/api/teachers')
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setTeachers(arr);
          setFilteredTeachers(arr);
        });
    } else {
      alert(data.message || 'Failed to assign courses');
    }
  };

  const handleEditSubject = async (form) => {
    const res = await fetch(`http://localhost:5000/api/subjects/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
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
      alert(data.message || 'Failed to update subject');
    }
  };

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
                            <button className={`px-3 py-1 rounded font-semibold ${t.active ? 'bg-yellow-500 text-white hover:bg-yellow-700' : 'bg-green-500 text-white hover:bg-green-700'}`} onClick={() => handleToggleActive(t)}>{t.active ? 'Make Inactive' : 'Make Active'}</button>
                            <button className="px-3 py-1 rounded bg-blue-400 text-white font-semibold hover:bg-blue-700" onClick={() => openAssignCoursesModal(t)}>Assign Courses</button>
                            <button className="px-3 py-1 rounded bg-purple-500 text-white font-semibold hover:bg-purple-700" onClick={() => { setHolidayTeacher(t); setShowHolidayModal(true); }}>Add Holiday</button>
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
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">+ Add Subject</button>
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
              <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg shadow text-base">
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
                          <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-700">Delete</button>
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
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">+ Add Topic</button>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-6 border border-blue-200">
              <p className="text-gray-500">[Topics table will go here]</p>
            </div>
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
        <AddTeacherModal onClose={() => setShowAddTeacher(false)} onSubmit={handleAddTeacher} />
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
          allCourses={allCourses}
          assignedCourseIds={assignCoursesAssigned}
          onClose={() => { setAssignCoursesModalOpen(false); setAssignCoursesTeacher(null); setAssignCoursesAssigned([]); }}
          onSubmit={handleAssignCourses}
        />
      )}
      {showHolidayModal && holidayTeacher && (
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
              userId={holidayTeacher.id}
              teacherName={holidayTeacher.name}
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
    </div>
  );
}
