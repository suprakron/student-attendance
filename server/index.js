const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const PORT = 4000;

const db = new sqlite3.Database('../server/student_checklist.db', (err) => {
  if (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูล:', err.message);
  } else {
    db.run("PRAGMA busy_timeout = 5000");
    db.run("PRAGMA journal_mode = WAL");
    console.log("⚙️ ตั้งค่า busy_timeout และ WAL mode แล้ว");
  }
});

app.use(cors());
app.use(bodyParser.json());



app.post('/register', async (req, res) => {
  const { firstName, lastName, telephone, classroom, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run(
      `INSERT INTO TS03_DataRegister (firstName, lastName, telephone, classroom, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, telephone, classroom, email, hashedPassword],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        db.run(
          `INSERT INTO TS04_dataLogin (email, password) VALUES (?, ?)`,
          [email, hashedPassword],
          function (err2) {
            if (err2) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err2.message });
            }
            db.run("COMMIT");
            return res.status(200).json({ message: 'User registered successfully' });
          }
        );
      }
    );
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM TS04_dataLogin WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', user });
  });
});



db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL;");
  console.log("⚙️ ตั้งค่า WAL mode แล้ว");

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS TS01_DetailStudent (
  //     id TEXT PRIMARY KEY,
  //     firstname TEXT,
  //     lastname TEXT,
  //     classlevel TEXT
  //   )
  // `, (err) => {
  //   if (err) console.error('❌ CREATE TABLE error:', err.message);
  //   else console.log('✅ สร้างตาราง TS01_DetailStudent (ถ้ายังไม่มี)');
  // });

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS TS02_Attendance (
  //     attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     student_id TEXT,
  //     class_name TEXT,
  //     date TEXT,
  //     status TEXT,
  //     remark TEXT,
  //     FOREIGN KEY(student_id) REFERENCES TS01_DetailStudent(id)
  //   )
  // `, (err) => {
  //   if (err) console.error('❌ CREATE TABLE TS02_Attendance error:', err.message);
  //   else console.log('✅ สร้างตาราง TS02_Attendance (ถ้ายังไม่มี)');
  // });
});


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
// GET students who haven't checked in today for a specific class
const util = require('util');
const dbAll = util.promisify(db.all).bind(db);

app.get('/api/attendance/unmarked', async (req, res) => {
  const { classlevel, classroom, date } = req.query;
  const today = date || new Date().toISOString().split('T')[0];
  const className = `${classlevel}/${classroom}`;

  try {
    console.log('Query params:', req.query);

    const rows = await dbAll(
      `
SELECT s.id, s.firstname, s.lastname,
       a.status, a.class_name
FROM students s
LEFT JOIN TS02_Attendance a
  ON s.id = a.student_id AND a.date = ?
WHERE s.classlevel = ? AND s.classroom = ?

      `,
      [today, className, classlevel, classroom]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching unmarked attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance/mark', async (req, res) => {
  const { student_id, date, status, remark, class_name } = req.body;

  try {
    await db.run(`
      INSERT INTO TS02_Attendance (student_id, class_name, date, status, remark)
      VALUES (?, ?, ?, ?, ?)
    `, [student_id, class_name, date, status, remark]);

    res.json({ message: '✅ เช็คชื่อสำเร็จ' });
  } catch (err) {
    console.error('❌ Error inserting attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ตรวจสอบสถานะการเช็คชื่อของห้องเรียนในวันนั้น
app.get('/api/attendance/status', async (req, res) => {
  const { classlevel, classroom, date } = req.query;

  try {
    const data = await db.all(`
      SELECT s.id AS student_id, a.status, a.class_name
      FROM students s
      LEFT JOIN TS02_Attendance a ON s.id = a.student_id AND a.date = ?
      WHERE s.classlevel = ? AND s.classroom = ?
    `, [date, classlevel, classroom]);

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching attendance status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
