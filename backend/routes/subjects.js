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

// Add a new subject
router.post('/subjects', async (req, res) => {
  const { name, course_id, semester } = req.body;
  if (!name || !course_id || !semester) {
    return res.status(400).json({ message: 'Name, course, and semester are required' });
  }
  try {
    await db.query(
      'INSERT INTO subjects (name, course_id, semester) VALUES (?, ?, ?)',
      [name, course_id, semester]
    );
    res.json({ message: 'Subject added successfully' });
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

// Add a new topic
router.post('/topics', async (req, res) => {
  const { name, subject_id } = req.body;
  if (!name || !subject_id) {
    return res.status(400).json({ message: 'Name and subject_id are required' });
  }
  try {
    await db.query(
      'INSERT INTO topics (name, subject_id) VALUES (?, ?)',
      [name, subject_id]
    );
    res.json({ message: 'Topic added successfully' });
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

// Update a topic
router.put('/topics/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subject_id } = req.body;
  if (!name || !subject_id) {
    return res.status(400).json({ message: 'Name and subject_id are required' });
  }
  try {
    await db.query('UPDATE topics SET name=?, subject_id=? WHERE id=?', [name, subject_id, id]);
    res.json({ message: 'Topic updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a subject by ID
router.delete('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Subject ID is required' });
  try {
    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a topic by ID
router.delete('/topics/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Topic ID is required' });
  try {
    await db.query('DELETE FROM topics WHERE id = ?', [id]);
    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all subjects assigned to a teacher
router.get('/teacher-subjects', async (req, res) => {
  const { teacher_id } = req.query;
  if (!teacher_id) return res.status(400).json({ message: 'teacher_id is required' });
  try {
    const [rows] = await db.query('SELECT course_id, subject_id FROM teacher_subjects WHERE teacher_id = ?', [teacher_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign subjects to a teacher (replace all assignments)
router.post('/teacher-subjects/assign', async (req, res) => {
  const { teacher_id, assignments } = req.body;
  if (!teacher_id || !Array.isArray(assignments)) {
    return res.status(400).json({ message: 'teacher_id and assignments are required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM teacher_subjects WHERE teacher_id = ?', [teacher_id]);
    if (assignments.length > 0) {
      const values = assignments.map(a => [teacher_id, a.course_id, a.subject_id]);
      await conn.query('INSERT INTO teacher_subjects (teacher_id, course_id, subject_id) VALUES ?', [values]);
    }
    await conn.commit();
    res.json({ message: 'Subjects assigned successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
});

// Get subtopics for a topic
router.get('/subtopics', async (req, res) => {
  const { topic_id } = req.query;
  if (!topic_id) {
    return res.status(400).json({ message: 'topic_id is required' });
  }
  try {
    const [subtopics] = await db.query(
      'SELECT id, name, description, `order` FROM subtopics WHERE topic_id = ? ORDER BY `order` ASC, id ASC',
      [topic_id]
    );
    res.json(subtopics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new subtopic
router.post('/subtopics', async (req, res) => {
  const { name, topic_id, description, order } = req.body;
  if (!name || !topic_id) {
    return res.status(400).json({ message: 'Name and topic_id are required' });
  }
  try {
    await db.query(
      'INSERT INTO subtopics (name, topic_id, description, `order`) VALUES (?, ?, ?, ?)',
      [name, topic_id, description || '', order || null]
    );
    res.json({ message: 'Subtopic added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a subtopic
router.put('/subtopics/:id', async (req, res) => {
  const { id } = req.params;
  const { name, topic_id, description, order } = req.body;
  if (!name || !topic_id) {
    return res.status(400).json({ message: 'Name and topic_id are required' });
  }
  try {
    await db.query('UPDATE subtopics SET name=?, topic_id=?, description=?, `order`=? WHERE id=?', [name, topic_id, description || '', order || null, id]);
    res.json({ message: 'Subtopic updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a subtopic by ID
router.delete('/subtopics/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Subtopic ID is required' });
  try {
    await db.query('DELETE FROM subtopics WHERE id = ?', [id]);
    res.json({ message: 'Subtopic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
