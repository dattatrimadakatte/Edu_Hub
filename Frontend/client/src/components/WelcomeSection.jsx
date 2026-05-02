import React from 'react';
import { PlusCircle, Calendar } from 'lucide-react';

const WelcomeSection = ({ onAddResource, userName }) => {
  const getGreeting = () => {
            const hour = new Date().getHours();
  
             if (hour < 12) return 'Good morning';
             if (hour < 18) return 'Good afternoon';
                  return 'Good evening';
              };
              const greeting = getGreeting();
  return (
    <div className="welcome-section">
      <div className="welcome-content">
        <h1 className="welcome-title">{greeting}, {userName || 'Student'}! 🌟</h1>
        <p className="welcome-subtitle">You're doing great! Keep up the momentum.</p>
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-number">7</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="quick-stat">
            <span className="stat-number">85%</span>
            <span className="stat-label">Completion</span>
          </div>
        </div>
      </div>
      <div className="welcome-actions">
        <button className="primary-btn" onClick={onAddResource}>
          <PlusCircle size={18} />
          Add Resource
        </button>
       
      </div>
    </div>
  );
};

export default WelcomeSection;