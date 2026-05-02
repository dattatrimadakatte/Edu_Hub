import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Video } from 'lucide-react';
import { scheduleAPI } from '../services/api';

const UpcomingSessions = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingSessions();
  }, [user]);

  const fetchUpcomingSessions = async () => {
    try {
      const scheduleData = await scheduleAPI.getWeeklySchedule();
      
      // Filter sessions for current user if instructor
      const userSessions = scheduleData.filter(session => 
        user?.role === 'instructor' ? session.instructor === user.name : true
      );
      
      // Convert to upcoming sessions format
      const upcomingSessions = userSessions.map(session => ({
        id: session.id,
        title: session.course,
        instructor: session.instructor,
        time: session.time,
        date: getNextDateForDay(session.day),
        day: session.day,
        room: session.room,
        status: isToday(session.day) ? 'today' : 'scheduled'
      }));

      // Sort by date/time
      upcomingSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setSessions(upcomingSessions.slice(0, 5)); // Show next 5 sessions
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      // Mock data
      setSessions([
        {
          id: 1,
          title: 'JavaScript Masterclass',
          instructor: user?.name || 'You',
          time: '3:00 PM',
          date: 'Today',
          day: 'Today',
          room: 'Room 101',
          status: 'today'
        },
        {
          id: 2,
          title: 'React Performance Tips',
          instructor: user?.name || 'You',
          time: '10:00 AM',
          date: 'Tomorrow',
          day: 'Tomorrow',
          room: 'Online',
          status: 'scheduled'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getNextDateForDay = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = days.indexOf(dayName);
    
    if (targetDay === -1) return 'Unknown';
    
    let daysUntilTarget = targetDay - todayDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    if (daysUntilTarget === 0) return 'Today';
    if (daysUntilTarget === 1) return 'Tomorrow';
    
    return targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dayName) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today === dayName;
  };

  const handleSetReminder = (session) => {
    // In a real app, this would set a browser notification or calendar reminder
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Reminder set for ${session.title}`, {
            body: `${session.date} at ${session.time} in ${session.room}`,
            icon: '/favicon.ico'
          });
        }
      });
    }
    alert(`Reminder set for ${session.title} on ${session.date} at ${session.time}`);
  };

  const handleJoinClass = (session) => {
    // In a real app, this would open the video conferencing link
    if (session.room === 'Online') {
      window.open('https://meet.google.com/sample-link', '_blank');
    } else {
      alert(`Please go to ${session.room} for ${session.title}`);
    }
  };

  if (loading) return <div className="loading">Loading sessions...</div>;

  return (
    <div className="content-card">
      <div className="card-header">
        <h3 className="content-title">Upcoming Sessions</h3>
        <button className="calendar-btn">
          <Calendar size={16} />
        </button>
      </div>
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <p>No upcoming sessions scheduled.</p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className={`session-item ${session.status}`}>
              <div className="session-info">
                <h4 className="session-title">{session.title}</h4>
                <div className="session-details">
                  <span className="session-time">
                    <Clock size={14} />
                    {session.time}
                  </span>
                  <span className="session-date">{session.date}</span>
                  <span className="session-room">{session.room}</span>
                </div>
                {user?.role !== 'instructor' && (
                  <span className="session-instructor">
                    👨‍🏫 {session.instructor}
                  </span>
                )}
              </div>
              <div className="session-actions">
                <button 
                  className="action-btn reminder"
                  onClick={() => handleSetReminder(session)}
                  title="Set Reminder"
                >
                  <Bell size={14} />
                </button>
                {session.status === 'today' && (
                  <button 
                    className="action-btn join"
                    onClick={() => handleJoinClass(session)}
                    title="Join Class"
                  >
                    <Video size={14} />
                    Join
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingSessions;