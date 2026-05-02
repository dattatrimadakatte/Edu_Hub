import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Users, FileText, BarChart3, Calendar, Plus, LogOut, Search, X } from 'lucide-react';
import { dashboardAPI } from './services/api';
import Resources from './components/Resources.jsx';
import Schedule from './components/Schedule.jsx';
import Forum from './components/Forum.jsx';
import Settings from './components/Settings.jsx';
import TopBar from './components/TopBar.jsx';
import UpcomingSessions from './components/UpcomingSessions.jsx';
import TeacherAssignmentsList from './components/TeacherAssignmentsList.jsx';
import './Dashboard.css';

const TeacherDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const data = await dashboardAPI.getTeacherDashboard(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC HELPERS ---
  const stats = dashboardData?.stats || { active_courses: 0, total_students: 0, assignments: 0, avg_performance: 0 };
  
  const filteredActivities = useMemo(() => {
    const activities = dashboardData?.recent_activity || [];
    if (!searchTerm) return activities;
    return activities.filter(act => 
      act.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dashboardData, searchTerm]);

  // --- HANDLERS ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCourse = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      instructor_id: user.id
    };

    try {
      const response = await fetch('http://localhost:8000/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse)
      });
      
      if (response.ok) {
        setShowCourseModal(false);
        fetchData();
        alert("Course created successfully and is now visible to students!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create course');
      }
    } catch (err) { 
      console.error('Error creating course:', err);
      alert(`Error saving course to database: ${err.message}`); 
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAssignment = {
      title: formData.get('title'),
      description: formData.get('description'),
      due_date: formData.get('due_date'),
      course_id: parseInt(formData.get('course_id')) || 1,
      teacher_id: user.id,
      points: parseInt(formData.get('points')) || 100
    };

    try {
      const response = await fetch('http://localhost:8000/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment)
      });
      
      if (response.ok) {
        setShowAssignmentModal(false);
        fetchData();
        alert("Assignment created successfully and is now visible to students!");
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (err) { 
      console.error('Error creating assignment:', err);
      alert("Error creating assignment. Please try again."); 
    }
  };

  // --- REUSABLE COMPONENTS ---
  const Modal = ({ title, onClose, children }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <X onClick={onClose} style={{cursor: 'pointer'}} />
        </div>
        {children}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome, {user?.name || 'Teacher'}! 👨‍🏫</h1>
          <p className="welcome-subtitle">Manage your classes and track student progress.</p>
        </div>
        <div className="welcome-actions">
          <button className="primary-btn" onClick={() => setShowCourseModal(true)}>
            <Plus size={18} /> Create Course
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card modern blue">
          <div className="stat-icon blue"><BookOpen /></div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.active_courses}</h4>
            <p className="stat-title">Active Courses</p>
          </div>
        </div>
        <div className="stat-card modern green">
          <div className="stat-icon green"><Users /></div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.total_students}</h4>
            <p className="stat-title">Total Students</p>
          </div>
        </div>
        <div className="stat-card modern purple">
          <div className="stat-icon purple"><FileText /></div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.assignments}</h4>
            <p className="stat-title">Assignments</p>
          </div>
        </div>
        <div className="stat-card modern orange">
          <div className="stat-icon orange"><BarChart3 /></div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.avg_performance}%</h4>
            <p className="stat-title">Avg. Performance</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card large">
          <div className="card-header"><h3 className="content-title">Recent Activity</h3></div>
          <div className="activity-list">
            {filteredActivities.length > 0 ? filteredActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.type === 'submission' ? '📝' : '👥'}</div>
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            )) : <p className="no-results">No matches found.</p>}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header"><h3 className="content-title">Upcoming Sessions</h3></div>
          <UpcomingSessions user={user} />
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    if (loading) return <div className="loading">Loading EduHub...</div>;
    switch (activeTab) {
      case 'resources': return <Resources user={user} />;
      case 'schedule': return <Schedule user={user} />;
      case 'forum': return <Forum user={user} />;
      case 'settings': return <Settings user={user} />;
      case 'assignments': return (
        <div className="assignments-section">
          <div className="content-card large">
            <div className="card-header">
              <h3 className="content-title">Assignments Management</h3>
              <button className="primary-btn compact add-assignment-btn" onClick={() => setShowAssignmentModal(true)}>
                <Plus size={16} /> Add Assignment
              </button>
            </div>
            <div className="assignments-content">
              <div className="assignments-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.assignments}</span>
                  <span className="stat-label">Total Assignments</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.submissions || 0}</span>
                  <span className="stat-label">Submitted</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Math.max(0, stats.assignments - (stats.submissions || 0))}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
              <TeacherAssignmentsList user={user} />
            </div>
          </div>
        </div>
      );
      default: return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-gradient"><BookOpen size={28} color="white" /></div>
          <div className="brand-text">
            <span className="sidebar-title">EduHub</span>
            <span className="sidebar-subtitle">Teacher Portal</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20}/> },
            { id: 'resources', label: 'My Resources', icon: <BookOpen size={20}/> },
            { id: 'assignments', label: 'Assignments', icon: <FileText size={20}/> },
            { id: 'schedule', label: 'Schedule', icon: <Calendar size={20}/> },
            { id: 'forum', label: 'Q&A Forum', icon: <Search size={20}/> }
          ].map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
      
      <main className="main-content">
        <TopBar onLogout={onLogout} user={user} />
        
        {renderContent()}
      </main>

      {/* --- MODALS --- */}
      {showCourseModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div className="course-modal-container">
            <div className="modal-header">
              <h3>Create New Course</h3>
              <X onClick={() => setShowCourseModal(false)} style={{cursor: 'pointer'}} />
            </div>
            <form onSubmit={handleCreateCourse} className="course-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Course Title *</label>
                  <input 
                    name="title" 
                    placeholder="e.g. React Fundamentals" 
                    required 
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label>Category *</label>
                  <select name="category" required className="form-select">
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Course Description *</label>
                <textarea 
                  name="description" 
                  placeholder="Describe what students will learn in this course..." 
                  required 
                  rows="4"
                  className="form-textarea"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowCourseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div className="assignment-modal-container">
            <div className="modal-header">
              <h3>Create New Assignment</h3>
              <X onClick={() => setShowAssignmentModal(false)} style={{cursor: 'pointer'}} />
            </div>
            <form onSubmit={handleCreateAssignment} className="assignment-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Assignment Title *</label>
                  <input 
                    name="title" 
                    placeholder="e.g. React Components Exercise" 
                    required 
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label>Points</label>
                  <input 
                    name="points" 
                    type="number" 
                    placeholder="100" 
                    min="1"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>Course *</label>
                  <select name="course_id" required className="form-select">
                    <option value="">Select Course</option>
                    <option value="1">React Fundamentals</option>
                    <option value="2">JavaScript Advanced</option>
                    <option value="3">Python Basics</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Due Date *</label>
                  <input 
                    name="due_date" 
                    type="datetime-local" 
                    required 
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Assignment Description *</label>
                <textarea 
                  name="description" 
                  placeholder="Describe the assignment requirements and instructions..." 
                  required 
                  rows="4"
                  className="form-textarea"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAssignmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;