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
  const conn = await db.getConnection();
  try {
    const leave_id = req.params.id;
    const { approver_id, remarks, force_pending } = req.body;
    // Get leave details
    const [[leave]] = await conn.query('SELECT * FROM leaves WHERE id = ?', [leave_id]);
    if (!leave) {
      conn.release();
      return res.status(404).json({ message: 'Leave not found' });
    }
    const user_id = leave.user_id;
    const leave_type_id = leave.leave_type_id;
    const days = parseFloat(leave.days || 1);
    const year = new Date(leave.date || leave.start_date || leave.created_at).getFullYear();
    // Get leave type name
    const [[type]] = await conn.query('SELECT name FROM leave_types WHERE leave_type_id = ?', [leave_type_id]);
    const leaveTypeName = type ? type.name : '';
    await conn.beginTransaction();
    // Debug log
    const [[debugBalance]] = await conn.query(
      'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?',
      [user_id, leave_type_id, year]
    );
    if (debugBalance) {
      const available = parseFloat(debugBalance.opening_balance) - parseFloat(debugBalance.used) + parseFloat(debugBalance.adjustments);
      console.log('[DEBUG] Approving leave:', {
        user_id, leave_type_id, year, days,
        opening_balance: debugBalance.opening_balance,
        used: debugBalance.used,
        adjustments: debugBalance.adjustments,
        available
      });
    } else {
      console.log('[DEBUG] No leave balance found for', { user_id, leave_type_id, year });
    }
    if (force_pending) {
      // If reverting from approved, restore balance
      if (leave.status === 'approved' && leaveTypeName && leaveTypeName.indexOf('LWP') === -1) {
        await conn.query(
          'UPDATE leave_balances SET used = used - ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
          [days, user_id, leave_type_id, year]
        );
      }
      await conn.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [approver_id, remarks || '', leave_id]
      );
      await conn.commit();
      conn.release();
      return res.json({ message: 'Leave set to pending' });
    }
    // If already approved, toggle to pending
    if (leave.status === 'approved') {
      await conn.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [approver_id, remarks || '', leave_id]
      );
      await conn.query(
        'UPDATE leave_balances SET used = used - ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
        [days, user_id, leave_type_id, year]
      );
      await conn.commit();
      conn.release();
      return res.json({ message: 'Leave set to pending' });
    }
    // For LWP, always approve
    if (leaveTypeName && leaveTypeName.indexOf('LWP') !== -1) {
      await conn.query(
        'UPDATE leaves SET status = "approved", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [approver_id, remarks || '', leave_id]
      );
      await conn.commit();
      conn.release();
      return res.json({ message: 'Leave approved (LWP)' });
    }
    // Check leave balance
    const [[balance]] = await conn.query(
      'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?',
      [user_id, leave_type_id, year]
    );
    if (!balance || parseFloat(balance.opening_balance) - parseFloat(balance.used) < days) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }
    // Deduct leave days
    await conn.query(
      'UPDATE leave_balances SET used = used + ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
      [days, user_id, leave_type_id, year]
    );
    await conn.query(
      'UPDATE leaves SET status = "approved", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
      [approver_id, remarks || '', leave_id]
    );
    await conn.commit();
    conn.release();
    res.json({ message: 'Leave approved' });
  } catch (err) {
    if (conn) { try { await conn.rollback(); conn.release(); } catch (e) {} }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reject a leave request
router.put('/leave-requests/:id/reject', async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { approver_id, remarks, force_pending } = req.body;
    if (force_pending) {
      await db.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [approver_id, remarks || '', leave_id]
      );
      return res.json({ message: 'Leave set to pending' });
    }
    // Get current status
    const [[leave]] = await db.query('SELECT status FROM leaves WHERE id = ?', [leave_id]);
    if (leave && leave.status === 'rejected') {
      await db.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [approver_id, remarks || '', leave_id]
      );
      return res.json({ message: 'Leave set to pending' });
    }
    await db.query(
      'UPDATE leaves SET status = "rejected", approver_id = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
      [approver_id, remarks || '', leave_id]
    );
    res.json({ message: 'Leave rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Escalate a leave request
router.put('/leave-requests/:id/escalate', async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { new_approver_id, remarks, force_pending } = req.body;
    if (force_pending) {
      await db.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, escalated = 0, updated_at = NOW() WHERE id = ?',
        [new_approver_id, remarks || '', leave_id]
      );
      return res.json({ message: 'Leave set to pending' });
    }
    // Get current status
    const [[leave]] = await db.query('SELECT status FROM leaves WHERE id = ?', [leave_id]);
    if (leave && leave.status === 'escalated') {
      await db.query(
        'UPDATE leaves SET status = "pending", approver_id = ?, remarks = ?, escalated = 0, updated_at = NOW() WHERE id = ?',
        [new_approver_id, remarks || '', leave_id]
      );
      return res.json({ message: 'Leave set to pending' });
    }
    await db.query(
      'UPDATE leaves SET status = "escalated", approver_id = ?, remarks = ?, escalated = 1, updated_at = NOW() WHERE id = ?',
      [new_approver_id, remarks || '', leave_id]
    );
    res.json({ message: 'Leave escalated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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

// Get all leaves
router.get('/leaves', async (req, res) => {
  try {
    const { hod_id } = req.query;
    console.log('hod_id:', hod_id);
    if (hod_id) {
      // Only show leaves for teachers who share a course with the HOD (excluding the HOD's own leaves)
      const [rows] = await db.query(`
        SELECT l.*, u.name AS applicant_name, u.department AS applicant_department
        FROM leaves l
        JOIN users u ON l.user_id = u.id
        WHERE u.role = 'teacher'
          AND l.user_id IN (
            SELECT DISTINCT tc2.teacher_id
            FROM teacher_courses tc1
            JOIN teacher_courses tc2 ON tc1.course_id = tc2.course_id
            WHERE tc1.teacher_id = ? AND tc2.teacher_id != ?
          )
        ORDER BY l.created_at DESC
      `, [hod_id, hod_id]);
      console.log('Returned applicants:', rows.map(r => [r.user_id, r.applicant_name, r.status, r.reason, r.leave_type_id]));
      console.log('Returned rows:', rows.length);
      res.json(rows);
    } else {
      const [rows] = await db.query(`
        SELECT l.*, u.name AS applicant_name, u.department AS applicant_department
        FROM leaves l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
      `);
      res.json(rows);
    }
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

// Add new leave category
router.post('/leave-types', async (req, res) => {
  const { name, max_per_year, carry_forward, description } = req.body;
  if (!name || !max_per_year || !description) {
    return res.status(400).json({ message: 'name, max_per_year, and description are required' });
  }
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Insert the new leave type
    const [result] = await conn.query(
      'INSERT INTO leave_types (name, max_per_year, carry_forward, description) VALUES (?, ?, ?, ?)',
      [name, max_per_year, carry_forward || 0, description]
    );
    
    const newLeaveTypeId = result.insertId;
    const currentYear = new Date().getFullYear();
    
    // Get all active teachers
    const [teachers] = await conn.query('SELECT id FROM users WHERE role = "teacher" AND active = 1');
    
    // Create leave balance entries for all teachers for the current year
    for (const teacher of teachers) {
      await conn.query(
        'INSERT INTO leave_balances (user_id, leave_type_id, year, opening_balance, used, adjustments) VALUES (?, ?, ?, ?, 0, 0)',
        [teacher.id, newLeaveTypeId, currentYear, max_per_year]
      );
    }
    
    await conn.commit();
    conn.release();
    
    res.json({ message: 'Leave category added successfully', leave_type_id: newLeaveTypeId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update leave category
router.put('/leave-types/:id', async (req, res) => {
  const leave_type_id = req.params.id;
  const { name, max_per_year, carry_forward, description } = req.body;
  if (!name || !max_per_year || !description) {
    return res.status(400).json({ message: 'name, max_per_year, and description are required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE leave_types SET name = ?, max_per_year = ?, carry_forward = ?, description = ? WHERE leave_type_id = ?',
      [name, max_per_year, carry_forward || 0, description, leave_type_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave category not found' });
    }
    res.json({ message: 'Leave category updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete leave category
router.delete('/leave-types/:id', async (req, res) => {
  const leave_type_id = req.params.id;
  try {
    // Check if this leave type is being used in any leave records
    const [leaves] = await db.query('SELECT COUNT(*) as count FROM leaves WHERE leave_type_id = ?', [leave_type_id]);
    if (leaves[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete leave category that is being used in leave records' });
    }
    
    // Check if this leave type is being used in any leave balances
    const [balances] = await db.query('SELECT COUNT(*) as count FROM leave_balances WHERE leave_type_id = ?', [leave_type_id]);
    if (balances[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete leave category that has leave balances' });
    }
    
    const [result] = await db.query('DELETE FROM leave_types WHERE leave_type_id = ?', [leave_type_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave category not found' });
    }
    res.json({ message: 'Leave category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get leave balances for a user
router.get('/leave-balances', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: 'user_id is required' });
  try {
    const [rows] = await db.query(
      `SELECT lb.*, lt.name as leave_type_name
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.leave_type_id
       WHERE lb.user_id = ?
       ORDER BY lb.year DESC, lt.name ASC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin adjustment endpoint
router.put('/leave-balances/adjust', async (req, res) => {
  const { user_id, leave_type_id, year, adjustment, reason, adjusted_by } = req.body;
  if (!user_id || !leave_type_id || !year || typeof adjustment !== 'number') {
    return res.status(400).json({ message: 'user_id, leave_type_id, year, and adjustment (number) are required' });
  }
  try {
    // Try to update existing row
    const [result] = await db.query(
      'UPDATE leave_balances SET adjustments = adjustments + ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
      [adjustment, user_id, leave_type_id, year]
    );
    if (result.affectedRows === 0) {
      // If not exists, insert new row
      await db.query(
        'INSERT INTO leave_balances (user_id, leave_type_id, year, opening_balance, used, adjustments) VALUES (?, ?, ?, 0, 0, ?)',
        [user_id, leave_type_id, year, adjustment]
      );
    }
    // Insert into adjustment_log
    await db.query(
      'INSERT INTO adjustment_log (user_id, leave_type_id, year, amount, reason, adjusted_by) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, leave_type_id, year, adjustment, reason || '', adjusted_by || null]
    );
    res.json({ message: 'Adjustment applied successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get adjustment history for a user/leave_type/year
router.get('/leave-balances/adjustments', async (req, res) => {
  const { user_id, leave_type_id, year } = req.query;
  if (!user_id || !leave_type_id || !year) {
    return res.status(400).json({ message: 'user_id, leave_type_id, and year are required' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM adjustment_log WHERE user_id = ? AND leave_type_id = ? AND year = ? ORDER BY created_at DESC',
      [user_id, leave_type_id, year]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
