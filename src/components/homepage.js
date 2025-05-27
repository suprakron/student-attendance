import React from 'react';
import '../assets/styles/homepage.css';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const handleCheckIn = () => {
    navigate('/dashboard');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="homepage-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">📘 ระบบเช็คชื่อ</div>
        <div className="navbar-links">
          <button className="nav-button" onClick={handleRegister}>ลงทะเบียน</button>
          <button className="nav-button" onClick={handleLogin}>เข้าสู่ระบบ</button>
        </div>
      </nav>

      {/* Main Card */}
      <div className="homepage-container">
        <div className="card">
          <div className="icon">📝</div>
          <h2 className="title">ระบบเช็คชื่อ</h2>
          <p className="description">ยินดีต้อนรับเข้าสู่ระบบบันทึกการเข้าเรียน</p>
          <button className="checkin-button" onClick={handleCheckIn}>เริ่มเช็คชื่อ</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 ระบบเช็คชื่อโดยโรงเรียนของเรา. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
