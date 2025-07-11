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
      'SELECT * FROM users WHERE email = ? OR mobile = ? LIMIT 1',
      [identifier, identifier]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    // Plain text password comparison (not secure)
    if (password !== user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Success!
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
