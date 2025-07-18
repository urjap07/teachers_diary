const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT id, name, code FROM courses');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all courses assigned to a teacher
router.get('/teacher-courses', async (req, res) => {
  const { teacher_id } = req.query;
  if (!teacher_id) return res.status(400).json({ message: 'teacher_id is required' });
  try {
    const [rows] = await db.query('SELECT course_id FROM teacher_courses WHERE teacher_id = ?', [teacher_id]);
    res.json(rows.map(r => r.course_id));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign courses to a teacher
router.post('/teacher-courses/assign', async (req, res) => {
  const { teacher_id, course_ids } = req.body;
  if (!teacher_id || !Array.isArray(course_ids)) {
    return res.status(400).json({ message: 'teacher_id and course_ids are required' });
  }
  try {
    // Remove all current assignments
    await db.query('DELETE FROM teacher_courses WHERE teacher_id = ?', [teacher_id]);
    // Add new assignments
    if (course_ids.length > 0) {
      const values = course_ids.map(cid => [teacher_id, cid]);
      await db.query('INSERT INTO teacher_courses (teacher_id, course_id) VALUES ?', [values]);
    }
    res.json({ message: 'Courses assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new course
router.post('/courses', async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }
  try {
    await db.query('INSERT INTO courses (name, code) VALUES (?, ?)', [name, code]);
    res.json({ message: 'Course added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a course
router.put('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }
  try {
    await db.query('UPDATE courses SET name=?, code=? WHERE id=?', [name, code, id]);
    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a course
router.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM courses WHERE id=?', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
