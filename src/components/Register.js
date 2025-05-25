import React, { useState } from 'react';
import '../assets/styles/Register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    telephone: '',
    classroom: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { firstName, lastName, telephone, classroom, email, password, confirmPassword } = formData;

    // ตรวจสอบข้อมูลครบ
    if (!firstName || !lastName || !telephone || !classroom || !email || !password || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      setSuccess('');
      return;
    }

    // ตรวจสอบเบอร์โทรศัพท์
    if (!/^[0-9]{10}$/.test(telephone)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)');
      setSuccess('');
      return;
    }

    // ตรวจสอบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      setSuccess('');
      return;
    }

    // ตรวจสอบรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setSuccess('');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, telephone, classroom, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ไม่สามารถสมัครสมาชิกได้');
      }

      setError('');
      setSuccess('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนหน้า...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="container">
      <h2 className="title">สมัครสมาชิก</h2>
      <form onSubmit={handleRegister} className="form">
        <div className="row">
          <input
            type="text"
            name="firstName"
            placeholder="ชื่อจริง"
            value={formData.firstName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="นามสกุล"
            value={formData.lastName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <input
          type="tel"
          name="telephone"
          placeholder="เบอร์โทรศัพท์ (10 หลัก)"
          value={formData.telephone}
          onChange={handleChange}
          className="input"
          required
        />

        <select
          name="classroom"
          value={formData.classroom}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">เลือกชั้นเรียน</option>
          {[1, 2, 3].map(level =>
            [1, 2, 3, 4].map(room => (
              <option key={`m${level}-${room}`} value={`ม.${level}/${room}`}>
                ม.{level}/{room}
              </option>
            ))
          )}
          {[4, 5, 6].map(level =>
            [1, 2, 3].map(room => (
              <option key={`m${level}-${room}`} value={`ม.${level}/${room}`}>
                ม.{level}/{room}
              </option>
            ))
          )}
        </select>

        <input
          type="email"
          name="email"
          placeholder="อีเมล"
          value={formData.email}
          onChange={handleChange}
          className="input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={formData.password}
          onChange={handleChange}
          className="input"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="ยืนยันรหัสผ่าน"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input"
          required
        />

        <button type="submit" className="button">สมัครสมาชิก</button>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}
      </form>
    </div>
  );
};

export default Register;
