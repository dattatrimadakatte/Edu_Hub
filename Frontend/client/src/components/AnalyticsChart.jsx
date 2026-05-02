import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';
import './AnalyticsChart.css';

const AnalyticsChart = ({ user }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [analyticsData, setAnalyticsData] = useState({
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [2.5, 4.2, 1.8, 5.1, 3.7, 1.2, 4.8],
      totalHours: 23.3
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [18.5, 22.3, 19.7, 25.1],
      totalHours: 85.6
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [45, 52, 38, 61, 55, 67, 72, 58, 63, 69, 74, 48],
      totalHours: 702
    }
  });

  const currentData = analyticsData[timeFilter];
  const maxValue = Math.max(...currentData.data);

  const getActivityBreakdown = () => {
    switch(timeFilter) {
      case 'week':
        return {
          videos: 75,
          reading: 25
        };
      case 'month':
        return {
          videos: 70,
          reading: 30
        };
      case 'year':
        return {
          videos: 72,
          reading: 28
        };
      default:
        return { videos: 75, reading: 25 };
    }
  };

  const breakdown = getActivityBreakdown();

  return (
    <div className="content-card large analytics-card">
      <div className="card-header">
        <h3 className="content-title">
          <TrendingUp size={20} />
          Learning Analytics
        </h3>
        <select 
          className="time-filter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="analytics-content">
        <div className="analytics-stats">
          <div className="stat-item">
            <Clock size={16} />
            <span>{currentData.totalHours}h total</span>
          </div>
          <div className="stat-item">
            <BookOpen size={16} />
            <span>{Math.round(currentData.totalHours / currentData.labels.length)}h avg</span>
          </div>
        </div>
        
        <div className="analytics-chart">
          <div className="chart-container">
            <div className="line-chart">
              <svg width="100%" height="200" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={`grid-${i}`}
                    x1="40" 
                    y1={40 + i * 30} 
                    x2="360" 
                    y2={40 + i * 30} 
                    stroke="#f0f0f0" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                  <text 
                    key={`y-label-${i}`}
                    x="30" 
                    y={45 + i * 30} 
                    fontSize="10" 
                    fill="#666" 
                    textAnchor="end"
                  >
                    {Math.round(maxValue - (i * maxValue / 4))}h
                  </text>
                ))}
                
                {/* Line path */}
                <path
                  d={currentData.labels.map((label, index) => {
                    const x = 60 + (index * (300 / (currentData.labels.length - 1)));
                    const y = 160 - ((currentData.data[index] / maxValue) * 120);
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#4299e1"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {currentData.labels.map((label, index) => {
                  const x = 60 + (index * (300 / (currentData.labels.length - 1)));
                  const y = 160 - ((currentData.data[index] / maxValue) * 120);
                  return (
                    <g key={`point-${index}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#4299e1"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        fontSize="10"
                        fill="#4299e1"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {currentData.data[index]}h
                      </text>
                    </g>
                  );
                })}
                
                {/* X-axis labels */}
                {currentData.labels.map((label, index) => {
                  const x = 60 + (index * (300 / (currentData.labels.length - 1)));
                  return (
                    <text 
                      key={`x-label-${index}`}
                      x={x} 
                      y="185" 
                      fontSize="10" 
                      fill="#666" 
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
        
        <div className="analytics-summary">
          <div className="summary-item">
            <div className="summary-dot purple"></div>
            <span>Video Lessons: {breakdown.videos}%</span>
          </div>
          <div className="summary-item">
            <div className="summary-dot green"></div>
            <span>Reading: {breakdown.reading}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;