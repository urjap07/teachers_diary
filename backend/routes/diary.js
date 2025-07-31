const express = require('express');
const router = express.Router();
const db = require('../config/db');
const ExcelJS = require('exceljs');

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

// Get diary entries for a specific teacher or all entries, with optional date range filtering
router.get('/diary-entries', async (req, res) => {
  const { user_id, start_date, end_date } = req.query;
  try {
    let query = `
      SELECT de.id, de.user_id, de.course_id, de.lecture_number, de.start_time, de.end_time, de.date, de.subject, de.topic_covered, de.remarks, de.semester, de.created_at,
             c.name AS course_name,
             u.name AS teacher_name
      FROM diary_entries de
      LEFT JOIN courses c ON de.course_id = c.id
      LEFT JOIN users u ON de.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (user_id) {
      query += ' AND de.user_id = ?';
      params.push(user_id);
    }
    if (start_date && end_date) {
      query += ' AND de.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    query += ' ORDER BY de.date DESC, de.start_time DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Export diary entries to Excel (date-range or month-wise)
router.get('/export-excel', async (req, res) => {
  const { type, startDate, endDate, month, year, user_id } = req.query;
  try {
    let query = `
      SELECT de.id, de.user_id, de.course_id, de.lecture_number, de.start_time, de.end_time, de.date, de.subject, de.topic_covered, de.remarks, de.semester, de.created_at,
             c.name AS course_name,
             u.name AS teacher_name
      FROM diary_entries de
      LEFT JOIN courses c ON de.course_id = c.id
      LEFT JOIN users u ON de.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (user_id) {
      query += ' AND de.user_id = ?';
      params.push(user_id);
    }
    if (type === 'date-range' && startDate && endDate) {
      query += ' AND de.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (type === 'month-wise' && month && year) {
      query += ' AND MONTH(de.date) = ? AND YEAR(de.date) = ?';
      params.push(month, year);
    }
    query += ' ORDER BY de.date DESC, de.start_time DESC';
    const [rows] = await db.query(query, params);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Diary Entries');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Teacher', key: 'teacher_name', width: 20 },
      { header: 'Course', key: 'course_name', width: 20 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Lecture #', key: 'lecture_number', width: 10 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Start Time', key: 'start_time', width: 12 },
      { header: 'End Time', key: 'end_time', width: 12 },
      { header: 'Subject', key: 'subject', width: 20 },
      { header: 'Topic', key: 'topic_covered', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 24 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];
    rows.forEach(row => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="diary_entries.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
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

// --- Public Holidays Endpoints ---
// Get all public holidays
router.get('/holidays', async (req, res) => {
  try {
    const [holidays] = await db.query('SELECT * FROM holidays ORDER BY date ASC');
    // Force date to YYYY-MM-DD string to avoid timezone issues
    const holidaysFixed = holidays.map(h => ({
      ...h,
      date: h.date instanceof Date
        ? (h.date.getFullYear() + '-' +
           String(h.date.getMonth() + 1).padStart(2, '0') + '-' +
           String(h.date.getDate()).padStart(2, '0'))
        : h.date
    }));
    res.json(holidaysFixed);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new public holiday (admin only)
router.post('/holidays', async (req, res) => {
  // Assume req.user.role is available and checked for 'admin'
  // In production, use proper auth middleware
  // if (!req.user || req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  const { date, name } = req.body;
  if (!date || !name) {
    return res.status(400).json({ message: 'Date and name are required' });
  }
  try {
    // Ensure date is always a string in YYYY-MM-DD format
    let dateStr = date;
    if (date instanceof Date) {
      dateStr = date.toISOString().slice(0, 10);
    } else if (typeof date === 'string' && date.length > 10) {
      dateStr = date.slice(0, 10);
    }
    await db.query('INSERT INTO holidays (date, name) VALUES (?, ?)', [dateStr, name]);
    res.json({ message: 'Holiday added successfully' });
  } catch (err) {
    console.log('Error adding holiday:', err); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit a public holiday (admin only)
router.put('/holidays/:id', async (req, res) => {
  // if (!req.user || req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  const { id } = req.params;
  const { date, name } = req.body;
  if (!date || !name) {
    return res.status(400).json({ message: 'Date and name are required' });
  }
  try {
    await db.query('UPDATE holidays SET date=?, name=? WHERE id=?', [date, name, id]);
    res.json({ message: 'Holiday updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a public holiday (admin only)
router.delete('/holidays/:id', async (req, res) => {
  // if (!req.user || req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  const { id } = req.params;
  try {
    await db.query('DELETE FROM holidays WHERE id=?', [id]);
    res.json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Leave Applications ---
// Teachers can apply for leave
router.post('/leaves', async (req, res) => {
  const { user_id, start_date, end_date, reason, days, remarks, leave_type_id, course_id } = req.body;
  if (!user_id || !start_date || !end_date || !leave_type_id) {
    return res.status(400).json({ message: 'user_id, start_date, end_date, and leave_type_id are required' });
  }
  try {
    const daysNum = days ? parseFloat(days) : 1;
    // For backward compatibility, set date = start_date
    await db.query(
      'INSERT INTO leaves (user_id, start_date, end_date, date, reason, days, status, remarks, leave_type_id, course_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, start_date, end_date, start_date, reason || '', daysNum, 'pending', remarks || '', leave_type_id, course_id || null]
    );
    res.json({ message: 'Leave applied successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/leaves', async (req, res) => {
  const { user_id, year, hod_id, user_role } = req.query;
  try {
    let rows;
    let baseQuery = `
      SELECT 
        l.*, 
        u.name AS applicant_name,
        u.department AS applicant_department,
        u.name AS teacher_name,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS teacher_courses
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN teacher_courses tc ON u.id = tc.teacher_id
      LEFT JOIN courses c ON tc.course_id = c.id
    `;
    let where = [];
    let params = [];
    
    if (user_id) {
      where.push('l.user_id = ?');
      params.push(user_id);
    }
    if (year) {
      where.push('YEAR(l.start_date) = ?');
      params.push(year);
    }
    
    // HOD filtering based on course assignments
    if (hod_id && user_role === 'hod') {
      where.push(`
        l.user_id IN (
          SELECT DISTINCT tc.teacher_id
          FROM teacher_courses tc
          JOIN courses c ON tc.course_id = c.id
          WHERE c.hod_id = ?
        )
      `);
      params.push(hod_id);
      
      // Also filter the courses shown to only those where the HOD is assigned
      baseQuery = `
        SELECT 
          l.*, 
          u.name AS applicant_name,
          u.department AS applicant_department,
          GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS teacher_courses
        FROM leaves l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN teacher_courses tc ON u.id = tc.teacher_id
        LEFT JOIN courses c ON tc.course_id = c.id AND c.hod_id = ?
      `;
      params.unshift(hod_id); // Add hod_id at the beginning for the courses filter
    }
    
    if (where.length > 0) {
      baseQuery += ' WHERE ' + where.join(' AND ');
    }
    baseQuery += ' GROUP BY l.id, l.user_id, l.start_date, l.end_date, l.reason, l.days, l.status, l.remarks, l.leave_type_id, l.created_at, l.updated_at, u.name, u.department';
    baseQuery += ' ORDER BY l.start_date DESC';
    
    [rows] = await db.query(baseQuery, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update leave status (approve/reject)
router.patch('/leaves/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (approved, rejected, pending) is required' });
  }
  
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // Get current leave details
      const [[leave]] = await conn.query('SELECT * FROM leaves WHERE id = ?', [id]);
      if (!leave) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ message: 'Leave not found' });
      }
      
      const user_id = leave.user_id;
      const leave_type_id = leave.leave_type_id;
      const days = parseFloat(leave.days || 1);
      const year = new Date(leave.start_date || leave.date || leave.created_at).getFullYear();
      const previousStatus = leave.status;
      
      // Get leave type name to check if it's LWP (Leave Without Pay)
      const [[type]] = await conn.query('SELECT name FROM leave_types WHERE leave_type_id = ?', [leave_type_id]);
      const leaveTypeName = type ? type.name : '';
      const isLWP = leaveTypeName && leaveTypeName.indexOf('LWP') !== -1;
      
      // Handle different status changes
      if (status === 'approved') {
        // Only deduct balance if not LWP and not already approved
        if (!isLWP && previousStatus !== 'approved') {
          // Check if balance exists
          const [[balance]] = await conn.query(
            'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?',
            [user_id, leave_type_id, year]
          );
          
          if (!balance) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ message: 'No leave balance found for this leave type and year' });
          }
          
          const available = parseFloat(balance.opening_balance) - parseFloat(balance.used) + parseFloat(balance.adjustments || 0);
          if (available < days) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ message: 'Insufficient leave balance' });
          }
          
          // Deduct leave days
          await conn.query(
            'UPDATE leave_balances SET used = used + ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
            [days, user_id, leave_type_id, year]
          );
        }
      } else if (status === 'rejected') {
        // If previously approved and not LWP, restore the balance
        if (previousStatus === 'approved' && !isLWP) {
          await conn.query(
            'UPDATE leave_balances SET used = used - ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
            [days, user_id, leave_type_id, year]
          );
        }
      } else if (status === 'pending') {
        // If changing from approved to pending and not LWP, restore the balance
        if (previousStatus === 'approved' && !isLWP) {
          await conn.query(
            'UPDATE leave_balances SET used = used - ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
            [days, user_id, leave_type_id, year]
          );
        }
      }
      
      // Update leave status
      await conn.query('UPDATE leaves SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
      
      await conn.commit();
      conn.release();
      res.json({ message: 'Leave status updated successfully' });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error('Error updating leave status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
