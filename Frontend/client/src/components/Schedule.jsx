import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { scheduleAPI } from '../services/api';
import './Schedule.css';

const Schedule = ({ user }) => {
  const [scheduleData, setScheduleData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    try {
      const data = await scheduleAPI.getWeeklySchedule();
      console.log('Fetched schedule data:', data);
      setScheduleData(data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      // Mock data - same schedule for all users (admin-created)
      const mockSchedule = [
        { id: 1, day: 'Monday', time: '09:00 AM', course: 'Data Structures', room: 'Lab 2', instructor: 'Dr. Smith' },
        { id: 2, day: 'Monday', time: '11:30 AM', course: 'Python Basics', room: 'Room 302', instructor: 'Prof. Johnson' },
        { id: 3, day: 'Tuesday', time: '10:00 AM', course: 'Web Development', room: 'Online', instructor: 'Ms. Davis' },
        { id: 4, day: 'Wednesday', time: '10:00 AM', course: 'Algorithms', room: 'Hall A', instructor: 'Dr. Wilson' },
        { id: 5, day: 'Thursday', time: '02:00 PM', course: 'React Advanced', room: 'Room 101', instructor: 'Mr. Brown' },
        { id: 6, day: 'Friday', time: '09:00 AM', course: 'Database Design', room: 'Lab 1', instructor: 'Dr. Taylor' },
      ];
      
      // Sort mock data by time for consistency
      const sortedMockSchedule = mockSchedule.sort((a, b) => {
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
      
      setScheduleData(sortedMockSchedule);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert 12-hour to 24-hour format for sorting
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) return <div className="loading">Loading schedule...</div>;

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="content-title">Weekly Class Schedule</h2>
        <p className="welcome-subtitle">
          {user?.role === 'admin' ? 'Manage the weekly teaching schedule' : 
           user?.role === 'instructor' ? 'Your teaching schedule for this week' :
           'Your class schedule for this week'}
        </p>
      </div>

      <div className="schedule-grid">
        {days.map(day => (
          <div key={day} className="day-column">
            <h3 className="day-label">{day}</h3>
            <div className="classes-container">
              {scheduleData
                .filter(c => c.day === day)
                .sort((a, b) => {
                  // Sort by time within each day
                  const timeA = convertTo24Hour(a.time);
                  const timeB = convertTo24Hour(b.time);
                  return timeA.localeCompare(timeB);
                })
                .map((cls, idx) => (
                  <div key={idx} className="class-card">
                    <span className="class-time">
                      <Clock size={14} /> {cls.time}
                    </span>
                    <h4 className="class-name">{cls.course}</h4>
                    <span className="class-room">
                      <MapPin size={14} /> {cls.room}
                    </span>
                    {cls.instructor && (
                      <span className="class-instructor">
                        👨‍🏫 {cls.instructor}
                      </span>
                    )}
                  </div>
                ))}
              {scheduleData.filter(c => c.day === day).length === 0 && (
                <div className="no-class">No classes</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;