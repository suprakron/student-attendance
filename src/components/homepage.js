
import React from 'react';
import '../assets/styles/homepage.css';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const navigate = useNavigate();
      const handleCheckIn = () => {
    navigate('/dashboard');
  };
  return (
     <div className="homepage-container">
      <div className="card">
        <div className="icon">✔️</div>
        <h2 className="title">ระบบเช็คชื่อ</h2>
        <p className="description">ยินดีต้อนรับเข้าสู่ระบบบันทึกการเข้าเรียน</p>
        <button className="checkin-button" onClick={handleCheckIn}>เริ่มเช็คชื่อ</button>
      </div>
    </div>
  );
};

export default Homepage;
