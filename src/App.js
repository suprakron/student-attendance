
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddStudents from './components/AddStudents';
import UploadExcel from './components/UploadExcel';
import Attendance from './components/Attendance';
import SummaryChart from './components/SummaryChart';
import ExportData from './components/ExportData';
import { StudentProvider } from './contexts/StudentContext';
import Homepage from './components/homepage';

function App() {
  return (
    <StudentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-student" element={<AddStudents />} />
          <Route path="/upload-excel" element={<UploadExcel />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/summary" element={<SummaryChart />} />
          <Route path="/export" element={<ExportData />} />
        </Routes>
      </Router>
    </StudentProvider>

  );
}

export default App;
