const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Apply for leave
router.post('/leave-requests', async (req, res) => {
  const { user_id, from_date, to_date, leave_type_id, comments } = req.body;
  // Find user's supervisor
  const [user] = await db.query('SELECT reporting_to FROM users WHERE id = ?', [user_id]);
  const approver_id = user[0]?.reporting_to || null;
  // Insert leave request
  const [result] = await db.query(
    'INSERT INTO leave_requests (user_id, from_date, to_date, leave_type_id, status, approver_id, comments) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, from_date, to_date, leave_type_id, 'pending', approver_id, comments || '']
  );
  // Add to audit log
  await db.query(
    'INSERT INTO audit_log (leave_id, action_by, action_type, remarks) VALUES (?, ?, ?, ?)',
    [result.insertId, user_id, 'applied', comments || '']
  );
  res.json({ message: 'Leave request submitted', leave_id: result.insertId });
});

// Get leave requests for a user
router.get('/leave-requests', async (req, res) => {
  const { user_id } = req.query;
  const [rows] = await db.query(
    'SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC',
    [user_id]
  );
  res.json(rows);
});

// Get pending leave requests for an approver
router.get('/leave-requests/pending', async (req, res) => {
  const { approver_id } = req.query;
  const [rows] = await db.query(
    'SELECT * FROM leave_requests WHERE approver_id = ? AND status = \"pending\" ORDER BY created_at DESC',
    [approver_id]
  );
  res.json(rows);
});

// Approve a leave request
router.put('/leave-requests/:id/approve', async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { approver_id, remarks } = req.body;
    await db.query(
      'UPDATE leave_requests SET status = "approved", updated_at = NOW() WHERE leave_id = ?',
      [leave_id]
    );
    console.log('Inserting audit log for leave_id:', leave_id);
    await db.query(
      'INSERT INTO audit_log (leave_id, action_by, action_type, remarks) VALUES (?, ?, ?, ?)',
      [leave_id, approver_id, 'approved', remarks || '']
    );
    res.json({ message: 'Leave approved' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2' || err.message.includes('a foreign key constraint fails')) {
      res.status(400).json({ message: 'Invalid leave_id: no such leave request exists', error: err.message });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// Reject a leave request
router.put('/leave-requests/:id/reject', async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { approver_id, remarks } = req.body;
    await db.query(
      'UPDATE leave_requests SET status = "rejected", updated_at = NOW() WHERE leave_id = ?',
      [leave_id]
    );
    console.log('Inserting audit log for leave_id:', leave_id);
    await db.query(
      'INSERT INTO audit_log (leave_id, action_by, action_type, remarks) VALUES (?, ?, ?, ?)',
      [leave_id, approver_id, 'rejected', remarks || '']
    );
    res.json({ message: 'Leave rejected' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2' || err.message.includes('a foreign key constraint fails')) {
      res.status(400).json({ message: 'Invalid leave_id: no such leave request exists', error: err.message });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// Escalate a leave request
router.put('/leave-requests/:id/escalate', async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { new_approver_id, remarks } = req.body;
    await db.query(
      'UPDATE leave_requests SET status = "escalated", approver_id = ?, escalated = TRUE, updated_at = NOW() WHERE leave_id = ?',
      [new_approver_id, leave_id]
    );
    console.log('Inserting audit log for leave_id:', leave_id);
    await db.query(
      'INSERT INTO audit_log (leave_id, action_by, action_type, remarks) VALUES (?, ?, ?, ?)',
      [leave_id, new_approver_id, 'escalated', remarks || '']
    );
    res.json({ message: 'Leave escalated' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2' || err.message.includes('a foreign key constraint fails')) {
      res.status(400).json({ message: 'Invalid leave_id: no such leave request exists', error: err.message });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// Get audit log for a leave request
router.get('/leave-requests/:id/audit', async (req, res) => {
  const leave_id = req.params.id;
  const [rows] = await db.query(
    'SELECT * FROM audit_log WHERE leave_id = ? ORDER BY timestamp ASC',
    [leave_id]
  );
  res.json(rows);
});

router.get('/leaves', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/leave-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leave_types ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
