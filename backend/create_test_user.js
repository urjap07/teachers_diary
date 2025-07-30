const db = require('./config/db');

async function createTestUser() {
  try {
    // Check if test user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@test.com']);
    
    if (existing.length === 0) {
      // Create test admin user
      await db.query(
        'INSERT INTO users (name, email, mobile, password_hash, role, is_hod, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@test.com', '1111111111', 'admin123', 'admin', 0, 0]
      );
      console.log('Test admin user created: admin@test.com / admin123');
    } else {
      console.log('Test user already exists');
    }
    
    // Check if test teacher exists
    const [existingTeacher] = await db.query('SELECT id FROM users WHERE email = ?', ['teacher@test.com']);
    
    if (existingTeacher.length === 0) {
      // Create test teacher user
      await db.query(
        'INSERT INTO users (name, email, mobile, password_hash, role, is_hod, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Test Teacher', 'teacher@test.com', '2222222222', 'teacher123', 'teacher', 0, 0]
      );
      console.log('Test teacher user created: teacher@test.com / teacher123');
    } else {
      console.log('Test teacher already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
}

createTestUser(); 