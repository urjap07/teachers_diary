const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../config/db');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  return errors;
};

// Helper function to get course ID by code
const getCourseIdByCode = async (courseCode) => {
  const [rows] = await db.query('SELECT id FROM courses WHERE code = ?', [courseCode]);
  return rows.length > 0 ? rows[0].id : null;
};

// Helper function to get subject ID by name and course code
const getSubjectIdByNameAndCourse = async (subjectName, courseCode) => {
  const [rows] = await db.query(
    'SELECT s.id FROM subjects s JOIN courses c ON s.course_id = c.id WHERE s.name = ? AND c.code = ?',
    [subjectName, courseCode]
  );
  return rows.length > 0 ? rows[0].id : null;
};

// Helper function to get topic ID by name, subject name, and course code
const getTopicIdByNameAndSubject = async (topicName, subjectName, courseCode) => {
  const [rows] = await db.query(
    `SELECT t.id FROM topics t 
     JOIN subjects s ON t.subject_id = s.id 
     JOIN courses c ON s.course_id = c.id 
     WHERE t.name = ? AND s.name = ? AND c.code = ?`,
    [topicName, subjectName, courseCode]
  );
  return rows.length > 0 ? rows[0].id : null;
};

// Upload courses
router.post('/courses', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel is 1-indexed and we have headers

      // Handle different column naming conventions
      const courseName = row['Course Name'] || row['name'] || row['Name'];
      const courseCode = row['Course Code'] || row['code'] || row['Code'];
      const hodId = row['HOD ID'] || row['hod_id'] || row['HOD ID'] || null;

      // Validate required fields
      if (!courseName || courseName.toString().trim() === '') {
        results.errors.push(`Row ${rowNumber}: Course Name is required`);
        continue;
      }
      if (!courseCode || courseCode.toString().trim() === '') {
        results.errors.push(`Row ${rowNumber}: Course Code is required`);
        continue;
      }

      try {
        // Check if course already exists
        const [existing] = await db.query('SELECT id FROM courses WHERE code = ?', [courseCode]);
        
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Insert new course
        await db.query(
          'INSERT INTO courses (name, code, hod_id) VALUES (?, ?, ?)',
          [courseName, courseCode, hodId]
        );
        
        results.success++;
      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    res.json({
      message: 'Upload completed',
      results: results
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Upload subjects
router.post('/subjects', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      // Handle different column naming conventions for subjects
      const subjectName = row['Subject Name'] || row['name'] || row['Name'];
      const courseCode = row['Course Code'] || row['code'] || row['Code'];
      const courseId = row['course_id'] || row['Course ID'] || row['course_id'];
      const semester = row['Semester'] || row['semester'];

      // Validate required fields
      if (!subjectName || subjectName.toString().trim() === '') {
        results.errors.push(`Row ${rowNumber}: Subject Name is required`);
        continue;
      }
      if (!semester || semester.toString().trim() === '') {
        results.errors.push(`Row ${rowNumber}: Semester is required`);
        continue;
      }

      try {
        // Get course ID - handle both course code and course ID
        let finalCourseId = courseId;
        
        if (courseCode) {
          // If course code is provided, get course ID from code
          finalCourseId = await getCourseIdByCode(courseCode);
          if (!finalCourseId) {
            results.errors.push(`Row ${rowNumber}: Course with code '${courseCode}' not found`);
            continue;
          }
        } else if (courseId) {
          // If course ID is provided directly, validate it exists
          const [courseExists] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
          if (courseExists.length === 0) {
            results.errors.push(`Row ${rowNumber}: Course with ID '${courseId}' not found`);
            continue;
          }
          finalCourseId = courseId;
        } else {
          results.errors.push(`Row ${rowNumber}: Either Course Code or Course ID is required`);
          continue;
        }

        // Check if subject already exists for this course and semester
        const [existing] = await db.query(
          'SELECT id FROM subjects WHERE name = ? AND course_id = ? AND semester = ?',
          [subjectName, finalCourseId, semester]
        );
        
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Insert new subject
        await db.query(
          'INSERT INTO subjects (name, course_id, semester) VALUES (?, ?, ?)',
          [subjectName, finalCourseId, semester]
        );
        
        results.success++;
      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    res.json({
      message: 'Upload completed',
      results: results
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Upload topics
router.post('/topics', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      // Validate required fields
      const requiredFields = ['Topic Name', 'Subject Name', 'Course Code'];
      const validationErrors = validateRequiredFields(row, requiredFields);
      
      if (validationErrors.length > 0) {
        results.errors.push(`Row ${rowNumber}: ${validationErrors.join(', ')}`);
        continue;
      }

      try {
        // Get subject ID
        const subjectId = await getSubjectIdByNameAndCourse(row['Subject Name'], row['Course Code']);
        if (!subjectId) {
          results.errors.push(`Row ${rowNumber}: Subject '${row['Subject Name']}' not found for course '${row['Course Code']}'`);
          continue;
        }

        // Check if topic already exists for this subject
        const [existing] = await db.query(
          'SELECT id FROM topics WHERE name = ? AND subject_id = ?',
          [row['Topic Name'], subjectId]
        );
        
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Insert new topic
        await db.query(
          'INSERT INTO topics (name, subject_id) VALUES (?, ?)',
          [row['Topic Name'], subjectId]
        );
        
        results.success++;
      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    res.json({
      message: 'Upload completed',
      results: results
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Upload subtopics
router.post('/subtopics', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      // Validate required fields
      const requiredFields = ['Subtopic Name', 'Topic Name', 'Subject Name', 'Course Code'];
      const validationErrors = validateRequiredFields(row, requiredFields);
      
      if (validationErrors.length > 0) {
        results.errors.push(`Row ${rowNumber}: ${validationErrors.join(', ')}`);
        continue;
      }

      try {
        // Get topic ID
        const topicId = await getTopicIdByNameAndSubject(row['Topic Name'], row['Subject Name'], row['Course Code']);
        if (!topicId) {
          results.errors.push(`Row ${rowNumber}: Topic '${row['Topic Name']}' not found for subject '${row['Subject Name']}' and course '${row['Course Code']}'`);
          continue;
        }

        // Check if subtopic already exists for this topic
        const [existing] = await db.query(
          'SELECT id FROM subtopics WHERE name = ? AND topic_id = ?',
          [row['Subtopic Name'], topicId]
        );
        
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Insert new subtopic
        await db.query(
          'INSERT INTO subtopics (name, topic_id, description, `order`) VALUES (?, ?, ?, ?)',
          [row['Subtopic Name'], topicId, row['Description'] || '', row['Order'] || null]
        );
        
        results.success++;
      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    res.json({
      message: 'Upload completed',
      results: results
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Download template
router.get('/template/:type', (req, res) => {
  const { type } = req.params;
  
  let template = [];
  let filename = '';
  
  switch (type) {
    case 'courses':
      template = [
        { 'Course Name': 'BCom', 'Course Code': 'BCOM001', 'HOD ID': '3' },
        { 'Course Name': 'BCA', 'Course Code': 'BCA001', 'HOD ID': '3' },
        { 'name': 'MBBS', 'code': 'MBBS701', 'hod_id': '3' },
        { 'name': 'Civil', 'code': 'Civil801', 'hod_id': '3' }
      ];
      filename = 'courses_template.xlsx';
      break;
      
    case 'subjects':
      template = [
        { 'Subject Name': 'Financial Accounting', 'Course Code': 'BCOM001', 'Semester': '1' },
        { 'Subject Name': 'Programming in C', 'Course Code': 'BCA001', 'Semester': '1' },
        { 'name': 'Marketing', 'course_id': '18', 'semester': 'semester 1' },
        { 'name': 'Low code / No code', 'course_id': '3', 'semester': 'semester 3' }
      ];
      filename = 'subjects_template.xlsx';
      break;
      
    case 'topics':
      template = [
        { 'Topic Name': 'Ledger Posting', 'Subject Name': 'Financial Accounting', 'Course Code': 'BCOM001' },
        { 'Topic Name': 'C Syntax', 'Subject Name': 'Programming in C', 'Course Code': 'BCA001' }
      ];
      filename = 'topics_template.xlsx';
      break;
      
    case 'subtopics':
      template = [
        { 'Subtopic Name': 'Basic Ledger', 'Topic Name': 'Ledger Posting', 'Subject Name': 'Financial Accounting', 'Course Code': 'BCOM001', 'Description': 'Introduction to ledger', 'Order': '1' },
        { 'Subtopic Name': 'Variables', 'Topic Name': 'C Syntax', 'Subject Name': 'Programming in C', 'Course Code': 'BCA001', 'Description': 'Variable declaration', 'Order': '1' }
      ];
      filename = 'subtopics_template.xlsx';
      break;
      
    default:
      return res.status(400).json({ message: 'Invalid template type' });
  }
  
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = router; 