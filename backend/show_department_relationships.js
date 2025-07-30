const db = require('./config/db');

async function showDepartmentRelationships() {
  try {
    console.log('=== DEPARTMENT RELATIONSHIPS BASED ON COURSE SHARING ===\n');
    
    // Get all HODs
    const [hods] = await db.query('SELECT id, name, email FROM users WHERE is_hod = 1');
    
    for (const hod of hods) {
      console.log(`\n--- HOD: ${hod.name} (ID: ${hod.id}) ---`);
      
      // Get teachers who share courses with this HOD
      const [teachers] = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email
        FROM users u
        JOIN teacher_courses tc2 ON u.id = tc2.teacher_id
        WHERE u.role = 'teacher' 
          AND u.id IN (
            SELECT DISTINCT tc2.teacher_id
            FROM teacher_courses tc1
            JOIN teacher_courses tc2 ON tc1.course_id = tc2.course_id
            WHERE tc1.teacher_id = ? AND tc2.teacher_id != ?
          )
        ORDER BY u.name
      `, [hod.id, hod.id]);
      
      if (teachers.length === 0) {
        console.log('  No teachers found in this department');
      } else {
        console.log(`  Teachers in department (${teachers.length}):`);
        teachers.forEach(teacher => {
          console.log(`    - ${teacher.name} (${teacher.email})`);
        });
      }
      
      // Show shared courses
      const [sharedCourses] = await db.query(`
        SELECT DISTINCT c.id, c.name, c.code
        FROM courses c
        JOIN teacher_courses tc1 ON c.id = tc1.course_id
        JOIN teacher_courses tc2 ON c.id = tc2.course_id
        WHERE tc1.teacher_id = ? AND tc2.teacher_id != ?
        ORDER BY c.name
      `, [hod.id, hod.id]);
      
      if (sharedCourses.length > 0) {
        console.log(`  Shared courses (${sharedCourses.length}):`);
        sharedCourses.forEach(course => {
          console.log(`    - ${course.name} (${course.code})`);
        });
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('HODs can see leave requests from teachers who share courses with them.');
    console.log('This creates department-like groupings based on course assignments.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

showDepartmentRelationships(); 