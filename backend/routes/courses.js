const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT id, name FROM courses');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
