// src/components/SummaryChart.js
import React, { useEffect, useState } from 'react';
 
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SummaryChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      

      

      const summary = {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
      };

 

      setChartData({
        labels: ['มาเรียน', 'มาสาย', 'ขาด', 'ลา'],
        datasets: [
          {
            label: 'จำนวนครั้ง',
            data: [
              summary.present,
              summary.late,
              summary.absent,
              summary.leave
            ],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3'],
            borderRadius: 8,
            barThickness: 50
          }
        ]
      });
    };

    fetchAttendance();
  }, []);

  return (
    <div className="summary-chart-container">
      <div className="summary-card">
        <h2 className="summary-title">📊 สรุปผลการเช็กชื่อ (รวมทั้งหมด)</h2>
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    font: {
                      size: 14
                    }
                  }
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        ) : (
          <p>⏳ กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </div>
  );
};

export default SummaryChart;
