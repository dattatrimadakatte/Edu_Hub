import React from 'react';
import {
  Layout,
  BookOpen,
  Video,
  MessageSquare,
  Users,
  Award,
  Target,
  Settings,
  FileText,
  Calendar
} from 'lucide-react';
import NavItem from './NavItem.jsx';

const Sidebar = ({ activeTab, onTabChange, userRole }) => {
  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: Video },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'forum', label: 'Q&A Forum', icon: MessageSquare },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const teacherTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'courses', label: 'My Courses', icon: Video },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'forum', label: 'Q&A Forum', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const tabs = userRole === 'instructor' ? teacherTabs : studentTabs;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-gradient">
            <BookOpen size={28} color="white" />
          </div>
        </div>
        <div className="brand-text">
          <span className="sidebar-title">EduHub</span>
          <span className="sidebar-subtitle">{userRole === 'instructor' ? 'Teacher Portal' : 'Learning Platform'}</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <div 
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(tab.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="nav-icon"><Icon size={20}/></div>
              <span className="nav-label">{tab.label}</span>
            </div>
          );
        })}
      </nav>
      
      
    </aside>
  );
};

export default Sidebar;