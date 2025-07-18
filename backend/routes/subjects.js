const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get subjects for a course and semester (or all subjects)
router.get('/subjects', async (req, res) => {
  const { course_id, semester } = req.query;
  let query = 'SELECT id, name, course_id, semester FROM subjects';
  const params = [];
  if (course_id && semester) {
    query += ' WHERE course_id = ? AND semester = ?';
    params.push(course_id, semester);
  } else if (course_id) {
    query += ' WHERE course_id = ?';
    params.push(course_id);
  } else if (semester) {
    query += ' WHERE semester = ?';
    params.push(semester);
  }
  try {
    const [subjects] = await db.query(query, params);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get topics for a subject
router.get('/topics', async (req, res) => {
  const { subject_id } = req.query;
  if (!subject_id) {
    return res.status(400).json({ message: 'subject_id is required' });
  }
  try {
    const [topics] = await db.query(
      'SELECT id, name FROM topics WHERE subject_id = ?',
      [subject_id]
    );
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a subject
router.put('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, course_id, semester } = req.body;
  if (!name || !course_id || !semester) {
    return res.status(400).json({ message: 'Name, course, and semester are required' });
  }
  try {
    await db.query('UPDATE subjects SET name=?, course_id=?, semester=? WHERE id=?', [name, course_id, semester, id]);
    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
