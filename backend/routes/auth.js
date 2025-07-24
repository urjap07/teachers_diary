const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Try to find by mobile or email
    const [users] = await db.query(
      'SELECT id, name, email, role, shift, password_hash, active FROM users WHERE email = ? OR mobile = ? LIMIT 1',
      [identifier, identifier]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    // Check if user is active
    if (user.active !== 1) {
      return res.status(403).json({ message: 'Account is inactive. Please contact admin.' });
    }
    // Plain text password comparison (not secure)
    if (password !== user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Success!
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, role: user.role, shift: user.shift } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new teacher (admin only)
router.post('/add-teacher', async (req, res) => {
  const { name, email, mobile, password, courseIds, pDay } = req.body;
  console.log('Received courseIds:', courseIds, 'pDay:', pDay);
  if (!name || !email || !mobile || !password || !Array.isArray(courseIds) || typeof pDay === 'undefined') {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Check if email or mobile already exists
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1', [email, mobile]);
    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({ message: 'A user with this email or mobile already exists' });
    }
    // Insert new teacher with p_day
    const [result] = await conn.query(
      'INSERT INTO users (name, email, mobile, password_hash, role, p_day) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, mobile, password, 'teacher', parseInt(pDay, 10)]
    );
    const teacherId = result.insertId;
    // Assign courses
    if (courseIds.length > 0) {
      const values = courseIds.map(cid => [teacherId, cid]);
      await conn.query('INSERT INTO teacher_courses (teacher_id, course_id) VALUES ?', [values]);
    }
    await conn.commit();
    conn.release();
    res.json({ message: 'Teacher added successfully!' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT id, name, email, mobile, role, active FROM users WHERE role = ? ORDER BY id DESC', ['teacher']);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update teacher details
router.put('/teacher/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, password, active } = req.body;
  if (!name || !email || !mobile) {
    return res.status(400).json({ message: 'Name, email, and mobile are required' });
  }
  try {
    // If password is provided, update it; otherwise, don't change password
    if (password) {
      await db.query('UPDATE users SET name=?, email=?, mobile=?, password_hash=?, active=? WHERE id=?', [name, email, mobile, password, active, id]);
    } else {
      await db.query('UPDATE users SET name=?, email=?, mobile=?, active=? WHERE id=?', [name, email, mobile, active, id]);
    }
    res.json({ message: 'Teacher updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete teacher
router.delete('/teacher/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Remove course assignments
    await conn.query('DELETE FROM teacher_courses WHERE teacher_id=?', [id]);
    // Remove subject assignments if you have such a table
    await conn.query('DELETE FROM teacher_subjects WHERE teacher_id=?', [id]);
    // Remove the teacher
    await conn.query('DELETE FROM users WHERE id=? AND role=?', [id, 'teacher']);
    await conn.commit();
    conn.release();
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Set teacher active/inactive
router.patch('/teacher/:id/active', async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  try {
    await db.query('UPDATE users SET active=? WHERE id=? AND role=?', [active, id, 'teacher']);
    res.json({ message: 'Teacher status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
