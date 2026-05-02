import React, { useState, useEffect } from "react";
import { BookOpen, Clock, Award, TrendingUp, Calendar } from "lucide-react";
import { dashboardAPI } from './services/api';
import './Dashboard.css';
import AddResourceModal from './AddResourceModal.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import WelcomeSection from './components/WelcomeSection.jsx';
import StatCard from './components/StatCard.jsx';
import ActivityItem from './components/ActivityItem.jsx';
import SessionItem from './components/SessionItem.jsx';
import AnalyticsChart from './components/AnalyticsChart.jsx';
import Resources from './components/Resources.jsx';
import Courses from './components/Courses.jsx';
import Forum from './components/Forum.jsx';
import Achievements from './components/Achievements.jsx';
import Settings from './components/Settings.jsx';
import Assignments from './components/Assignments.jsx';
import Schedule from './components/Schedule.jsx';

const Dashboard = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardAPI.getStudentDashboard(user.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [user, activeTab]);

  if (loading && activeTab === 'dashboard') {
    return <div className="loading">Loading dashboard...</div>;
  }

  const stats = dashboardData?.stats || {};
  const activities = dashboardData?.recent_activity || [];

  const renderContent = () => {
    switch (activeTab) {
      case 'resources':
        return <Resources user={user} />;
      case 'courses':
        return <Courses user={user} />;
      case 'assignments':
        return <Assignments user={user} />;
      case 'schedule':
        return <Schedule user={user} />;
      case 'forum':
        return <Forum user={user} />;
      case 'achievements':
        return <Achievements user={user} />;
      case 'settings':
        return <Settings user={user} />;
      case 'dashboard':
      default:
        return (
          <>
            <WelcomeSection onAddResource={() => setIsModalOpen(true)} userName={user?.name} />

            <div className="stats-grid">
              <StatCard 
                title="Active Courses" 
                value={stats.active_courses || "8"} 
                change="+2 this week"
                icon={<BookOpen />} 
                colorClass="purple" 
              />
              <StatCard 
                title="Study Hours" 
                value={`${stats.study_hours || "24.5"}h`} 
                change="+3.2h from last week"
                icon={<Clock />} 
                colorClass="blue" 
              />
              <StatCard 
                title="Certificates" 
                value={stats.certificates || "12"} 
                change="+1 completed"
                icon={<Award />} 
                colorClass="green" 
              />
              <StatCard 
                title="Day Streak" 
                value={`${stats.day_streak || "7"} days`} 
                change="Keep it up!"
                icon={<TrendingUp />} 
                colorClass="orange" 
              />
            </div>

            <div className="content-grid">
              <AnalyticsChart user={user} />

              <div className="content-card">
                <div className="card-header">
                  <h3 className="content-title">Recent Activity</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="activity-list">
                  {activities.length > 0 ? activities.map((activity, index) => (
                    <ActivityItem 
                      key={index}
                      title={activity.title}
                      time={activity.time}
                      type={activity.type}
                    />
                  )) : (
                    <>
                      <ActivityItem 
                        title="Completed: React Hooks Deep Dive"
                        time="2 hours ago"
                        type="completion"
                      />
                      <ActivityItem 
                        title="Started: Advanced JavaScript Patterns"
                        time="Yesterday"
                        type="start"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="content-title">Upcoming Sessions</h3>
                  <button className="calendar-btn">
                    <Calendar size={16} />
                  </button>
                </div>
                <div className="sessions-list">
                  <SessionItem 
                    title="JavaScript Masterclass"
                    instructor="Sarah Chen"
                    time="3:00 PM"
                    date="Today"
                    status="live"
                    onSetReminder={(session) => {
                      console.log('Reminder set for:', session);
                      alert(`Reminder set for ${session.title}`);
                    }}
                    onJoinClass={(session) => {
                      console.log('Joining class:', session);
                      window.open('https://meet.google.com/sample-link', '_blank');
                    }}
                  />
                  <SessionItem 
                    title="React Performance Tips"
                    instructor="Mike Johnson"
                    time="10:00 AM"
                    date="Tomorrow"
                    status="scheduled"
                    onSetReminder={(session) => {
                      console.log('Reminder set for:', session);
                      alert(`Reminder set for ${session.title}`);
                    }}
                  />
                  <SessionItem 
                    title="Database Design Workshop"
                    instructor="Alex Rodriguez"
                    time="2:00 PM"
                    date="Friday"
                    status="scheduled"
                    onSetReminder={(session) => {
                      console.log('Reminder set for:', session);
                      alert(`Reminder set for ${session.title}`);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user?.role}
      />
      
      <main className="main-content">
        <TopBar onLogout={onLogout} user={user} />
        
        {renderContent()}
      </main>
      
      <AddResourceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
};

export default Dashboard;