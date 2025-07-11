const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get subjects for a course and semester
router.get('/subjects', async (req, res) => {
  const { course_id, semester } = req.query;
  if (!course_id || !semester) {
    return res.status(400).json({ message: 'course_id and semester are required' });
  }
  try {
    const [subjects] = await db.query(
      'SELECT id, name FROM subjects WHERE course_id = ? AND semester = ?',
      [course_id, semester]
    );
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

module.exports = router;
