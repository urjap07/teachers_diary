const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');
const coursesRoutes = require('./routes/courses');
const subjectsRoutes = require('./routes/subjects');
const leaveRoutes = require('./routes/leave');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Teacher\'s Diary backend is running!');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS test');
    res.json({ success: true, result: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api', authRoutes);
app.use('/api', diaryRoutes);
app.use('/api', coursesRoutes);
app.use('/api', subjectsRoutes);
app.use('/api', leaveRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', function (err) {
  console.error('Unhandled Rejection:', err);
});
