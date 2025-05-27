import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  // ดึงข้อมูลนักเรียนทั้งหมด แล้วจัดกลุ่มตาม classlevel
  useEffect(() => {
    axios
      .get('http://localhost:4000/api/attendance/all-classes')
      .then((response) => {
        const students = response.data;

        // จัดกลุ่มนักเรียนตาม classlevel
        const grouped = students.reduce((acc, student) => {
          const level = student.classlevel || 'ไม่ทราบระดับชั้น';
          if (!acc[level]) acc[level] = [];
          acc[level].push(student);
          return acc;
        }, {});

        setGroupedStudents(grouped);
      })
      .catch((error) => {
        console.error('❌ ดึงข้อมูลนักเรียนล้มเหลว:', error);
        setGroupedStudents({});
      });
  }, []);

  const openModal = async (level, students) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get('http://localhost:4000/api/attendance/all-classes');

      const attendanceMap = {};
      response.data.forEach((entry) => {
        attendanceMap[entry.student_id] = {
          status: entry.status,
          class_name: entry.class_name,
        };
      });

      const studentsWithStatus = students.map((student) => ({
        ...student,
        status: attendanceMap[student.student_id]?.status || '',
        class_name: attendanceMap[student.student_id]?.class_name || '',
      }));

      setSelectedRoomStudents(studentsWithStatus);
      setModalTitle(`ระดับชั้น ${level}`);
      setShowModal(true);
    } catch (error) {
      console.error('❌ ดึงสถานะการเช็คชื่อผิดพลาด:', error);
      setSelectedRoomStudents([]);
      setShowModal(true);
    }
  };

  const handleCheck = async (studentId) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      await axios.post('http://localhost:4000/api/attendance/mark', {
        student_id: studentId,
        date: today,
        status: 'มา',
        remark: '',
        class_name: modalTitle.replace('ระดับชั้น ', ''),
      });

      setSelectedRoomStudents((prev) =>
        prev.map((student) =>
          student.student_id === studentId
            ? { ...student, status: 'มา', class_name: modalTitle.replace('ระดับชั้น ', '') }
            : student
        )
      );
    } catch (error) {
      console.error('❌ เช็คชื่อไม่สำเร็จ:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoomStudents([]);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">รายชื่อนักเรียนแยกตามระดับชั้น</h2>

      {Object.entries(groupedStudents).map(([level, students]) => (
        <div className="level-container" key={level}>
          <h3 className="level-title">ระดับชั้น {level}</h3>
          <div className="rooms-wrapper">
            <div
              className="room-card clickable"
              onClick={() => openModal(level, students)}
            >
              <h4 className="room-title">คลิกรายชื่อนักเรียน {level}</h4>
            </div>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalTitle}</h3>
            <button className="close-button" onClick={closeModal}>ปิด</button>
            <ul className="student-list">
              {selectedRoomStudents.map((student) => (
                <li key={student.student_id} className="student-item">
                  <h4 className="student-class-name">{student.class_name || 'ไม่ทราบห้อง'}</h4>
                  <div className="student-info">
                    <span className="student-name">
                      {student.firstname || ''} {student.lastname || ''}
                    </span>
                    <span
                      className={`student-status ${student.status === 'มา' ? 'present' : 'not-checked'}`}
                      style={{ marginLeft: '10px' }}
                    >
                      {student.status || 'ยังไม่เช็คชื่อ'}
                    </span>
                  </div>
                  {!student.status && (
                    <button className="check-button" onClick={() => handleCheck(student.student_id)}>
                      เช็คชื่อ
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
