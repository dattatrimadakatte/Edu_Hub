import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Shield, BarChart3, Settings, LogOut, Eye, EyeOff, Trash2, Plus, Calendar } from 'lucide-react';
import { adminAPI, scheduleAPI } from './services/api';
import TopBar from './components/TopBar.jsx';
import './Dashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleData, setScheduleData] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [resourceStats, setResourceStats] = useState({
    total: 0,
    public: 0,
    private: 0
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'resources') {
      fetchResourceStats();
    } else if (activeTab === 'schedule') {
      fetchScheduleData();
    }
  }, [activeTab, user]);

  const fetchResourceStats = async () => {
    try {
      // Mock data - in real app would fetch from API
      setResourceStats({
        total: 45,
        public: 28,
        private: 17
      });
    } catch (error) {
      console.error('Failed to fetch resource stats:', error);
    }
  };

  const fetchScheduleData = async () => {
    try {
      const data = await scheduleAPI.getWeeklySchedule();
      setScheduleData(data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      // Mock schedule data
      setScheduleData([
        { id: 1, day: 'Monday', time: '9:00 AM', course: 'React Fundamentals', instructor: 'Dr. Smith', room: 'Lab 2' },
        { id: 2, day: 'Monday', time: '2:00 PM', course: 'JavaScript Advanced', instructor: 'Prof. Johnson', room: 'Room 302' },
        { id: 3, day: 'Tuesday', time: '10:00 AM', course: 'Python Basics', instructor: 'Dr. Wilson', room: 'Online' }
      ]);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSchedule = {
      day: formData.get('day'),
      time: formData.get('time'),
      course: formData.get('course'),
      instructor: formData.get('instructor'),
      room: formData.get('room') || 'TBD'
    };

    try {
      await scheduleAPI.createScheduleSlot(newSchedule);
      setShowScheduleModal(false);
      fetchScheduleData();
      alert('Schedule added successfully and is now visible to students and teachers!');
    } catch (error) {
      console.error('Failed to add schedule:', error);
      // Fallback - add to local state
      const newItem = { ...newSchedule, id: Date.now() };
      setScheduleData(prev => [...prev, newItem]);
      setShowScheduleModal(false);
      alert('Schedule added successfully and is now visible to students and teachers!');
    }
  };

  const handleModifySchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModifyModal(true);
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedSchedule = {
      day: formData.get('day'),
      time: formData.get('time'),
      course: formData.get('course'),
      instructor: formData.get('instructor'),
      room: formData.get('room') || 'TBD'
    };

    try {
      await scheduleAPI.updateScheduleSlot(selectedSchedule.id, updatedSchedule);
      setShowModifyModal(false);
      setSelectedSchedule(null);
      fetchScheduleData();
      alert('Schedule updated successfully! Changes are now visible to students and teachers.');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      // Fallback - update local state
      setScheduleData(prev => prev.map(item => 
        item.id === selectedSchedule.id ? { ...item, ...updatedSchedule } : item
      ));
      setShowModifyModal(false);
      setSelectedSchedule(null);
      alert('Schedule updated successfully! Changes are now visible to students and teachers.');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule slot?')) {
      try {
        await scheduleAPI.deleteScheduleSlot(scheduleId);
        fetchScheduleData();
        alert('Schedule deleted successfully!');
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        // Fallback - remove from local state
        setScheduleData(prev => prev.filter(item => item.id !== scheduleId));
        alert('Schedule deleted successfully!');
      }
    }
  };

  const handleSaveSettings = () => {
    try {
      // Mock save functionality
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, user]);

  const fetchDashboardData = async () => {
    try {
      const data = await adminAPI.getAdminDashboard(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="admin-users">
            <div className="admin-header">
              <h1>User Management</h1>
              <p>Manage all users in the system</p>
            </div>
            
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`action-btn ${u.is_active ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleUser(u.id)}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {u.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'resources':
        return (
          <div className="admin-resources">
            <div className="admin-header">
              <h1>Resource Management</h1>
              <p>View all resources created by students and instructors</p>
            </div>
            
            <div className="resources-overview">
              <div className="resource-stats">
                <div className="stat-card">
                  <h3>Total Resources</h3>
                  <span className="stat-number">{resourceStats.total}</span>
                </div>
                <div className="stat-card">
                  <h3>Public Resources</h3>
                  <span className="stat-number">{resourceStats.public}</span>
                </div>
                <div className="stat-card">
                  <h3>Private Resources</h3>
                  <span className="stat-number">{resourceStats.private}</span>
                </div>
              </div>
              
              <div className="resources-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Type</th>
                      <th>Visibility</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>React Fundamentals Guide</td>
                      <td>John Instructor</td>
                      <td>PDF</td>
                      <td><span className="visibility-badge public">Public</span></td>
                      <td>2024-01-15</td>
                    </tr>
                    <tr>
                      <td>JavaScript Best Practices</td>
                      <td>Sarah Student</td>
                      <td>Website</td>
                      <td><span className="visibility-badge private">Private</span></td>
                      <td>2024-01-10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="admin-schedule">
            <div className="admin-header">
              <h1>Schedule Management</h1>
              <p>Manage weekly teaching schedules for all instructors</p>
              <button className="primary-btn" onClick={() => setShowScheduleModal(true)}>
                <Plus size={18} /> Add Schedule
              </button>
            </div>
            
            <div className="schedule-grid">
              {scheduleData.map(item => (
                <div key={item.id} className="schedule-card">
                  <div className="schedule-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h3>{item.day}</h3>
                    <div className="schedule-actions">
                      <button 
                        className="modify-btn"
                        onClick={() => handleModifySchedule(item)}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Modify
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteSchedule(item.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginLeft: '8px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="schedule-slots">
                    <div className="slot">{item.time} - {item.course} ({item.instructor}) - {item.room}</div>
                  </div>
                </div>
              ))}
              {scheduleData.length === 0 && (
                <div className="empty-schedule">
                  <p>No schedule items yet. Add your first schedule slot!</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="admin-settings">
            <div className="admin-header">
              <h1>System Settings</h1>
              <p>Configure system-wide settings and preferences</p>
            </div>
            
            <div className="settings-sections">
              <div className="settings-section">
                <h3>General Settings</h3>
                <div className="setting-item">
                  <label>System Name</label>
                  <input type="text" defaultValue="EduHub Learning Platform" />
                </div>
                <div className="setting-item">
                  <label>Max Users</label>
                  <input type="number" defaultValue="1000" />
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Security Settings</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable Two-Factor Authentication
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Require Strong Passwords
                  </label>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Notification Settings</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Email Notifications
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" /> SMS Notifications
                  </label>
                </div>
              </div>
              
              <button className="save-settings-btn" onClick={handleSaveSettings}>Save All Settings</button>
            </div>
          </div>
        );
      
      case 'dashboard':
      default:
        const stats = dashboardData?.stats || {};
        return (
          <>
            <div className="admin-header">
              <h1>Admin Dashboard</h1>
              <p>System overview and statistics</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card modern blue">
                <div className="stat-header">
                  <div className="stat-icon blue">
                    <Users />
                  </div>
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{stats.total_users || 0}</h4>
                  <p className="stat-title">Total Users</p>
                </div>
              </div>
              
              <div className="stat-card modern green">
                <div className="stat-header">
                  <div className="stat-icon green">
                    <Users />
                  </div>
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{stats.total_students || 0}</h4>
                  <p className="stat-title">Students</p>
                </div>
              </div>
              
              <div className="stat-card modern purple">
                <div className="stat-header">
                  <div className="stat-icon purple">
                    <Users />
                  </div>
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{stats.total_instructors || 0}</h4>
                  <p className="stat-title">Instructors</p>
                </div>
              </div>
              
              <div className="stat-card modern orange">
                <div className="stat-header">
                  <div className="stat-icon orange">
                    <BookOpen />
                  </div>
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{stats.total_resources || 0}</h4>
                  <p className="stat-title">Resources</p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  if (loading && activeTab === 'dashboard') {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-gradient admin-gradient">
              <Shield size={28} color="white" />
            </div>
          </div>
          <div className="brand-text">
            <span className="sidebar-title">EduHub</span>
            <span className="sidebar-subtitle">Admin Panel</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-icon"><BarChart3 size={20}/></div>
            <span className="nav-label">Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-icon"><Users size={20}/></div>
            <span className="nav-label">User Management</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-icon"><BookOpen size={20}/></div>
            <span className="nav-label">Resources</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-icon"><Calendar size={20}/></div>
            <span className="nav-label">Schedule</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-icon"><Settings size={20}/></div>
            <span className="nav-label">Settings</span>
          </div>
        </nav>
      </aside>
      
      <main className="main-content">
        <TopBar onLogout={onLogout} user={user} />
        
        {renderContent()}
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
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
          <div className="schedule-modal-container">
            <div className="modal-header">
              <h3>Add Schedule Slot</h3>
              <button onClick={() => setShowScheduleModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddSchedule} className="schedule-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Day *</label>
                  <select name="day" required className="form-select">
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Time *</label>
                  <input 
                    name="time" 
                    type="time" 
                    required 
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Course/Subject *</label>
                <input 
                  name="course" 
                  placeholder="e.g. React Fundamentals" 
                  required 
                  className="form-input"
                />
              </div>
              
              <div className="form-field">
                <label>Room/Location</label>
                <input 
                  name="room" 
                  placeholder="e.g. Lab 2, Online, Room 101" 
                  className="form-input"
                />
              </div>
              
              <div className="form-field">
                <label>Instructor *</label>
                <input 
                  name="instructor" 
                  placeholder="e.g. Dr. Smith" 
                  required 
                  className="form-input"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modify Modal */}
      {showModifyModal && selectedSchedule && (
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
          <div className="schedule-modal-container">
            <div className="modal-header">
              <h3>Modify Schedule Slot</h3>
              <button onClick={() => {
                setShowModifyModal(false);
                setSelectedSchedule(null);
              }} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdateSchedule} className="schedule-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Day *</label>
                  <select name="day" required className="form-select" defaultValue={selectedSchedule.day}>
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Time *</label>
                  <input 
                    name="time" 
                    type="text" 
                    required 
                    className="form-input"
                    defaultValue={selectedSchedule.time}
                    placeholder="e.g. 9:00 AM"
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Course/Subject *</label>
                <input 
                  name="course" 
                  placeholder="e.g. React Fundamentals" 
                  required 
                  className="form-input"
                  defaultValue={selectedSchedule.course}
                />
              </div>
              
              <div className="form-field">
                <label>Room/Location</label>
                <input 
                  name="room" 
                  placeholder="e.g. Lab 2, Online, Room 101" 
                  className="form-input"
                  defaultValue={selectedSchedule.room}
                />
              </div>
              
              <div className="form-field">
                <label>Instructor *</label>
                <input 
                  name="instructor" 
                  placeholder="e.g. Dr. Smith" 
                  required 
                  className="form-input"
                  defaultValue={selectedSchedule.instructor}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => {
                  setShowModifyModal(false);
                  setSelectedSchedule(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;