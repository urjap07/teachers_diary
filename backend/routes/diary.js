const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/diary-entry', async (req, res) => {
  console.log('Received diary entry:', req.body);
  let { user_id, course_id, semester, lecture_number, start_time, end_time, date, subject_id, topic_id, remarks } = req.body;
  // Convert IDs to numbers
  user_id = Number(user_id);
  course_id = Number(course_id);
  lecture_number = Number(lecture_number);
  subject_id = Number(subject_id);
  topic_id = Number(topic_id);

  // remarks can be empty, but all other fields are required
  if (!user_id || !course_id || !semester || !lecture_number || !start_time || !end_time || !date) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }
  try {
    // Fetch subject name
    const [subjectRows] = await db.query('SELECT name FROM subjects WHERE id = ?', [subject_id]);
    const subject_name = subjectRows.length > 0 ? subjectRows[0].name : '';

    // Fetch topic name
    const [topicRows] = await db.query('SELECT name FROM topics WHERE id = ?', [topic_id]);
    const topic_name = topicRows.length > 0 ? topicRows[0].name : '';

    await db.query(
      'INSERT INTO diary_entries (user_id, course_id, lecture_number, start_time, end_time, subject, topic_covered, remarks, semester, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        course_id,
        lecture_number,
        start_time,
        end_time,
        subject_name,
        topic_name,
        remarks || '',
        semester,
        date
      ]
    );
    res.json({ message: 'Diary entry saved successfully' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get diary entries for a specific teacher or all entries
router.get('/diary-entries', async (req, res) => {
  const { user_id } = req.query;
  try {
    let rows;
    if (user_id) {
      // If user_id is provided, filter by user and join courses and users for course_name and teacher_name
      [rows] = await db.query(
        `SELECT de.id, de.user_id, de.course_id, de.lecture_number, de.start_time, de.end_time, de.date, de.subject, de.topic_covered, de.remarks, de.semester, de.created_at,
                c.name AS course_name,
                u.name AS teacher_name
         FROM diary_entries de
         LEFT JOIN courses c ON de.course_id = c.id
         LEFT JOIN users u ON de.user_id = u.id
         WHERE de.user_id = ?
         ORDER BY de.date DESC, de.start_time DESC`,
        [user_id]
      );
    } else {
      // If no user_id, return all entries with course_name and teacher_name
      [rows] = await db.query(
        `SELECT de.id, de.user_id, de.course_id, de.lecture_number, de.start_time, de.end_time, de.date, de.subject, de.topic_covered, de.remarks, de.semester, de.created_at,
                c.name AS course_name,
                u.name AS teacher_name
         FROM diary_entries de
         LEFT JOIN courses c ON de.course_id = c.id
         LEFT JOIN users u ON de.user_id = u.id
         ORDER BY de.date DESC, de.start_time DESC`
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Time-Off Endpoints ---
// Get time-off entries for a specific teacher or all
router.get('/time-off', async (req, res) => {
  const { user_id } = req.query;
  try {
    let rows;
    if (user_id) {
      [rows] = await db.query(
        'SELECT * FROM time_off WHERE user_id = ? ORDER BY date DESC',
        [user_id]
      );
    } else {
      [rows] = await db.query(
        'SELECT * FROM time_off ORDER BY date DESC'
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new time-off entry
router.post('/time-off', async (req, res) => {
  const { user_id, date, days, reason } = req.body;
  const daysNum = Number(days);
  if (!user_id || !date || !daysNum) {
    return res.status(400).json({ message: 'user_id, date, and days are required' });
  }
  try {
    await db.query(
      'INSERT INTO time_off (user_id, date, days, reason) VALUES (?, ?, ?, ?)',
      [user_id, date, daysNum, reason || '']
    );
    res.json({ message: 'Time-off entry added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
