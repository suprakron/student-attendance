import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/students/grouped')
      .then((response) => {
        setGroupedStudents(response.data);
      })
      .catch((error) => {
        console.error('❌ ดึงข้อมูลนักเรียนล้มเหลว:', error);
        setGroupedStudents({});
      });
  }, []);

const openModal = async (level, room, students) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // ดึงสถานะการเช็คชื่อทั้งหมดของห้องนี้ในวันนี้
    const response = await axios.get('http://localhost:4000/api/attendance/status', {
      params: {
        classlevel: level,
        classroom: room,
        date: today,
      },
    });

    // รวมข้อมูลนักเรียนกับสถานะที่ backend ส่งมา
    const attendanceMap = {};
    response.data.forEach(entry => {
      attendanceMap[entry.student_id] = {
        status: entry.status,
        class_name: entry.class_name,
      };
    });

    const studentsWithStatus = students.map(student => ({
      ...student,
      status: attendanceMap[student.id]?.status || '',
      class_name: attendanceMap[student.id]?.class_name || '',
    }));

    setSelectedRoomStudents(studentsWithStatus);
    setModalTitle(`ห้อง ${level}/${room}`);
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
      const response = await axios.post('http://localhost:4000/api/attendance/mark', {
        student_id: studentId,
        date: today,
        status: 'มา',
        remark: '',
        class_name: modalTitle.replace('ห้อง ', ''),
      });

setSelectedRoomStudents(prev =>
  prev.map(student =>
    student.id === studentId
      ? { ...student, status: 'มา', class_name: modalTitle.replace('ห้อง ', '') }
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
      <h2 className="dashboard-title">รายชื่อนักเรียนแยกตามสายชั้น</h2>

      {Object.entries(groupedStudents).map(([level, rooms]) => (
        <div className="level-container" key={level}>
          <h3 className="level-title">สายชั้น {level}</h3>
          <div className="rooms-wrapper">
            {Object.entries(rooms).map(([room, students]) => (
              <div
                className="room-card clickable"
                key={room}
                onClick={() => openModal(level, room, students)}
              >
                <h4 className="room-title">ห้อง {level}/{room}</h4>
              </div>
            ))}
          </div>
        </div>
      ))}

      { }
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalTitle}</h3>
            <button className="close-button" onClick={closeModal}>ปิด</button>
       <ul className="student-list">
{selectedRoomStudents.map((student) => (
  <li key={student.id} className="student-item">
    <span className="student-id">{student.id}</span> -{' '}
    <span className="student-name">{student.firstname} {student.lastname}</span>

    {(!student.class_name || student.class_name === '') &&
     (!student.status || student.status === '') ? (
      <button className="check-button" onClick={() => handleCheck(student.id)}>เช็คชื่อ</button>
    ) : (
      <span className="student-status"> - {student.status}</span>
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
