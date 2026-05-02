import React, { useState } from 'react';
import { Bell, Video, Calendar } from 'lucide-react';

const SessionItem = ({ title, instructor, time, status, date, onSetReminder, onJoinClass }) => {
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    setReminderSet(true);
    if (onSetReminder) {
      onSetReminder({ title, instructor, time, date });
    }
    // Show notification permission request
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleJoinClass = () => {
    if (onJoinClass) {
      onJoinClass({ title, instructor, time, date });
    }
  };

  return (
    <div className="session-item">
      <div className="session-info">
        <h4 className="session-title">{title}</h4>
        <p className="session-instructor">with {instructor}</p>
        <div className="session-details">
          <span className="session-time">
            <Calendar size={14} /> {date} at {time}
          </span>
        </div>
      </div>
      <div className="session-actions">
        <span className={`session-status ${status}`}>
          {status === 'live' ? '🔴 LIVE' : '📅 Scheduled'}
        </span>
        {status === 'live' ? (
          <button className="session-btn join" onClick={handleJoinClass}>
            <Video size={16} /> Join Now
          </button>
        ) : (
          <button 
            className={`session-btn remind ${reminderSet ? 'set' : ''}`} 
            onClick={handleSetReminder}
            disabled={reminderSet}
          >
            <Bell size={16} /> 
            {reminderSet ? 'Reminder Set' : 'Set Reminder'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionItem;