import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Attendance.css';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [classLevels, setClassLevels] = useState([]); // ✅ เพิ่ม

  useEffect(() => {
    axios.get('http://localhost:4000/api/students')
      .then(res => {
        setStudents(res.data);

        // ✅ สร้าง initial attendance data
        const initialData = {};
        res.data.forEach(student => {
          initialData[student.id] = { status: '', remark: '' };
        });
        setAttendanceData(initialData);

        const uniqueLevels = [...new Set(res.data.map(s => s.classlevel))];
        setClassLevels(uniqueLevels);
      })
      .catch(err => {
        console.error('❌ ดึงข้อมูลนักเรียนล้มเหลว:', err);
      });
  }, []);

  const handleStatusChange = (id, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleRemarkChange = (id, remark) => {
    setAttendanceData(prev => ({
      ...prev,
      [id]: { ...prev[id], remark }
    }));
  };

  const handleSaveAll = async () => {
    const today = new Date().toISOString().split('T')[0];
    const className = "ม.4/1"; 

    const payload = students.map(student => ({
      student_id: student.id,
      class_name: className,
      date: today,
      status: attendanceData[student.id]?.status || '',
      remark: attendanceData[student.id]?.status === 'ลา' ? attendanceData[student.id]?.remark || '' : null
    }));

    try {
      await axios.post('http://localhost:4000/api/attendance', payload);
      alert('✅ บันทึกการเช็กชื่อเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', err);
      alert('❌ บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div className="attendance-container">
      <h2 className="title">ระบบเช็กชื่อนักเรียน</h2>
      {/* ✅ แสดงสายชั้นที่มี */}
      {classLevels.length > 0 && (
        <p className="class-info">สายชั้นที่มี: {classLevels.join(', ')}</p>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>รหัส</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>สถานะ</th>
            <th>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.firstname}</td>
              <td>{student.lastname}</td>
              <td>
                <select
                  value={attendanceData[student.id]?.status || ''}
                  onChange={(e) => handleStatusChange(student.id, e.target.value)}
                >
                  <option value="">-- เลือก --</option>
                  <option value="มาเรียน">มาเรียน</option>
                  <option value="ขาด">ขาด</option>
                  <option value="มาสาย">มาสาย</option>
                  <option value="ลา">ลา</option>
                </select>
              </td>
              <td>
                {attendanceData[student.id]?.status === 'ลา' && (
                  <input
                    type="text"
                    value={attendanceData[student.id]?.remark || ''}
                    onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="save-button" onClick={handleSaveAll}>
        💾 บันทึกทั้งหมด
      </button>
    </div>
  );
};

export default Attendance;
