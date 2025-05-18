import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../assets/styles/AddStudents.css';
const AddStudents = () => {
    const [studentId, setStudentId] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');
    const [classlevel, setclasslevel] = useState('');

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!FirstName || !LastName || !classlevel || !studentId) {
            alert('กรุณากรอกชื่อและรหัสนักเรียนให้ครบ');
            return;
        }

       try {
      const response = await fetch('http://localhost:4000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: studentId.trim(),
          firstname: FirstName.trim(),
          lastname: LastName.trim(),
          classlevel: classlevel.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add student');

      alert('เพิ่มนักเรียนสำเร็จ!');
      setStudentId('');
      setFirstName('');
      setLastName('');
      setclasslevel('');
    } catch (err) {
      console.error('Error:', err);
      alert('ไม่สามารถเพิ่มนักเรียนได้');
    }     
    };
const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        try {
            const uploadPromises = jsonData.map((student) => {
                const newStudent = {
                    id: String(student.id).trim(),
                    firstname: String(student.firstname || student.firstName).trim(),
                    lastname: String(student.lastname).trim(),
                    classlev: String(student.classlevel || student.classlev).trim(),
                };

                // 🔁 ส่งข้อมูลไปยัง backend SQLite
                return fetch('http://localhost:5000/api/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newStudent),
                });
            });

            await Promise.all(uploadPromises);
            alert('อัปโหลดข้อมูลจาก Excel สำเร็จแล้ว!');
        } catch (err) {
            console.error('Upload error:', err);
            alert('เกิดข้อผิดพลาดในการอัปโหลดข้อมูล');
        }
    };

    reader.readAsArrayBuffer(file);
};

    return (
        <div className="add-student-container">
            <h2 className="title">เพิ่มข้อมูลนักเรียน</h2>
            <form className="student-form" onSubmit={handleAddStudent}>
                <input
                    className="input-field"
                    type="text"
                    placeholder="รหัสนักเรียน"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                />
                <input
                    className="input-field"
                    type="text"
                    placeholder="ชื่อ"
                    value={FirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    className="input-field"
                    type="text"
                    placeholder="นามสกุล"
                    value={LastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <select
                    className="input-field"
                    value={classlevel}
                    onChange={(e) => setclasslevel(e.target.value)}
                >
                    <option value="">-- เลือกระดับชั้น --</option>
                    {["ม.1/1", "ม.1/2", "ม.1/3", "ม.2/1", "ม.2/2", "ม.2/3", "ม.3/1", "ม.3/2", "ม.3/3", "ม.4/1", "ม.4/2", "ม.4/3", "ม.5/1", "ม.5/2", "ม.5/3", "ม.6/1", "ม.6/2", "ม.6/3"].map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                    ))}
                </select>

                <button className="submit-button" type="submit">
                    ➕ เพิ่มนักเรียน
                </button>
                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="excelUpload" className="submit-button" style={{ cursor: 'pointer' }}>
                        📥 อัปโหลดจาก Excel
                    </label>
                    <input
                        type="file"
                        id="excelUpload"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>

            </form>
        </div>
    );
};

export default AddStudents;
