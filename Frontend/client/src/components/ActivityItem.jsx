import React from 'react';

const ActivityItem = ({ title, time, type }) => {
  const getActivityIcon = () => {
    switch(type) {
      case 'completion': return '✅';
      case 'start': return '🚀';
      case 'achievement': return '🏆';
      case 'social': return '👥';
      default: return '📚';
    }
  };

  return (
    <div className="activity-item">
      <div className="activity-icon">{getActivityIcon()}</div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
};

export default ActivityItem;