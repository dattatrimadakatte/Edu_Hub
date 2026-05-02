import React from 'react';
import { Calendar, Clock, Award, TrendingUp, LogOut } from 'lucide-react';

const TopBar = ({ onLogout, user }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTitle = () => {
    if (user?.role === 'instructor') return 'Teacher Dashboard';
    if (user?.role === 'admin') return 'Admin Dashboard';
    return 'Student Dashboard';
  };

  const getRoleDisplay = () => {
    if (user?.role === 'instructor') return 'Teacher';
    if (user?.role === 'admin') return 'Administrator';
    return 'Student';
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <h2 className="page-title">{getTitle()}</h2>
        
        <div className="date-time-info">
          <Calendar size={14} /> {currentDate} • <Clock size={14} /> {currentTime}
        </div>
      </div>

      <div className="top-actions">
        <div className="user-info">
          <span className="user-name">{user?.name || getRoleDisplay()}</span>
          <span className="user-role">{getRoleDisplay()}</span>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;