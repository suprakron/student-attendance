const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4000;

// เชื่อมต่อ SQLite
const db = new sqlite3.Database('../server/student_checklist.db', (err) => {
  if (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูล:', err.message);
  } else {
    db.run("PRAGMA journal_mode = WAL;");
    console.log('✅ เชื่อมต่อฐานข้อมูล SQLite สำเร็จ');
  }
});

app.use(cors());
app.use(bodyParser.json());

// สร้างตาราง TS01_DetailStudent หากยังไม่มี
db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL;");
  console.log("⚙️ ตั้งค่า WAL mode แล้ว");

  db.run(`
    CREATE TABLE IF NOT EXISTS TS01_DetailStudent (
      id TEXT PRIMARY KEY,
      firstname TEXT,
      lastname TEXT,
      classlevel TEXT
    )
  `, (err) => {
    if (err) console.error('❌ CREATE TABLE error:', err.message);
    else console.log('✅ สร้างตาราง TS01_DetailStudent (ถ้ายังไม่มี)');
  });

  // สร้างตาราง TS02_Attendance หากยังไม่มี
  db.run(`
    CREATE TABLE IF NOT EXISTS TS02_Attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      class_name TEXT,
      date TEXT,
      status TEXT,
      remark TEXT,
      FOREIGN KEY(student_id) REFERENCES TS01_DetailStudent(id)
    )
  `, (err) => {
    if (err) console.error('❌ CREATE TABLE TS02_Attendance error:', err.message);
    else console.log('✅ สร้างตาราง TS02_Attendance (ถ้ายังไม่มี)');
  });
});

// Route GET ดึงข้อมูลนักเรียนทั้งหมด
app.get('/api/students', (req, res) => {
  const sql = `SELECT * FROM TS01_DetailStudent`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('❌ ดึงข้อมูลนักเรียนล้มเหลว:', err.message);
      res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลนักเรียนได้' });
    } else {
      res.json(rows);
    }
  });
});

// Route POST เพิ่มนักเรียนใหม่
app.post('/api/students', (req, res) => {
  const { id, firstname, lastname, classlevel } = req.body;
  const sql = `
    INSERT INTO TS01_DetailStudent (id, firstname, lastname, classlevel)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [id, firstname, lastname, classlevel], function (err) {
    if (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err.message);
      res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
    } else {
      res.status(200).json({ message: 'เพิ่มนักเรียนสำเร็จ' });
    }
  });
});

// Route POST บันทึกข้อมูลการเช็กชื่อ
app.post('/api/attendance', (req, res) => {
  const attendanceList = req.body;

  const sql = `
    INSERT INTO TS02_Attendance (student_id, class_name, date, status, remark)
    VALUES (?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(sql);

  db.serialize(() => {
    for (const item of attendanceList) {
      stmt.run([
        item.student_id,
        item.class_name,
        item.date,
        item.status,
        item.remark || null
      ]);
    }
    stmt.finalize((err) => {
      if (err) {
        console.error('❌ บันทึกการเช็กชื่อไม่สำเร็จ:', err.message);
        res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
      } else {
        res.status(200).json({ message: 'บันทึกข้อมูลการเช็กชื่อสำเร็จ' });
      }
    });
  });
});

// ✅ route: ดึงรายชื่อห้องเรียนที่มีการเช็กชื่อในวันที่กำหนด
app.get('/api/attendance/rooms', (req, res) => {
  const date = req.query.date;
  const query = `
    SELECT DISTINCT s.classlevel AS level, s.classroom AS room
    FROM TS02_Attendance a
    JOIN TS01_DetailStudent s ON a.student_id = s.id
    WHERE a.date = ?
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      console.error('❌ ดึงข้อมูลห้องเรียนไม่สำเร็จ:', err.message);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    res.json(rows);
  });
});

// ✅ route: ดึงรายชื่อห้องเรียนทั้งหมด
app.get('/api/rooms/all', (req, res) => {
  const query = `
    SELECT DISTINCT classlevel AS level, classroom AS room
    FROM TS01_DetailStudent
    ORDER BY classlevel ASC, classroom ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ ดึงข้อมูลห้องเรียนทั้งหมดไม่สำเร็จ:', err.message);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    res.json(rows);
  });
});

// ✅ route: ดึงรายชื่อนักเรียนแบบ grouped ตาม classlevel/classroom
app.get('/api/students/grouped', (req, res) => {
  db.all(`
    SELECT id, firstname, lastname, classlevel, classroom
    FROM TS01_DetailStudent
    ORDER BY classlevel, classroom, id
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const grouped = {};
    rows.forEach(student => {
      const level = student.classlevel;
      const room = student.classroom;
      if (!grouped[level]) grouped[level] = {};
      if (!grouped[level][room]) grouped[level][room] = [];
      grouped[level][room].push(student);
    });

    res.json(grouped);
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
