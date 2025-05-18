import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  const [groupedStudents, setGroupedStudents] = useState({});

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

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">รายชื่อนักเรียนแยกตามสายชั้น</h2>

      {Object.entries(groupedStudents).map(([level, rooms]) => (
        <div className="level-container" key={level}>
          <h3 className="level-title">สายชั้น {level}</h3>

          {Object.entries(rooms).map(([room, students]) => (
            <div className="room-container" key={room}>
              <h4 className="room-title">ห้อง {level}/{room}</h4>
              <ul className="student-list">
                {students.map((student) => (
                  <li key={student.id}>
                    {student.id} - {student.firstname} {student.lastname}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
