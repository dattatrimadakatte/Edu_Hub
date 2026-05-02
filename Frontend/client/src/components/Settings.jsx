import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, Palette, Globe, Shield, Save } from 'lucide-react';
import './Settings.css';

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: false,
      forum: true,
      courses: true
    },
    privacy: {
      profileVisible: true,
      showProgress: false,
      showAchievements: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Save settings logic here
      console.log('Saving settings:', settings);
      
      // Apply theme changes immediately
      const body = document.body;
      body.classList.remove('dark-theme', 'light-theme');
      
      if (settings.preferences.theme === 'dark') {
        body.classList.add('dark-theme');
      } else if (settings.preferences.theme === 'light') {
        body.classList.add('light-theme');
      } else if (settings.preferences.theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.add(isDark ? 'dark-theme' : 'light-theme');
      }
      
      // Apply language changes (mock implementation)
      if (settings.preferences.language !== 'en') {
        console.log('Language changed to:', settings.preferences.language);
        // In a real app, you would load language files and update the UI
      }
      
      // Apply timezone changes (mock implementation)
      if (settings.preferences.timezone) {
        console.log('Timezone changed to:', settings.preferences.timezone);
        // In a real app, you would update date/time displays
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        
        // Apply saved theme immediately
        const body = document.body;
        body.classList.remove('dark-theme', 'light-theme');
        
        if (parsed.preferences?.theme === 'dark') {
          body.classList.add('dark-theme');
        } else if (parsed.preferences?.theme === 'light') {
          body.classList.add('light-theme');
        } else if (parsed.preferences?.theme === 'auto') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          body.classList.add(isDark ? 'dark-theme' : 'light-theme');
        }
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  const ProfileSettings = () => (
    <div className="settings-section">
      <h3>Profile Information</h3>
      
      <div className="form-group">
        <label>Full Name</label>
        <div className="input-wrapper">
          <User size={20} className="input-icon" />
          <input
            type="text"
            value={user?.name || ''}
            readOnly
            placeholder="Enter your full name"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <div className="input-wrapper">
          <Mail size={20} className="input-icon" />
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Role</label>
        <div className="role-display">
          <span className={`role-badge ${user?.role}`}>
            {user?.role || 'student'}
          </span>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      
      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Email Notifications</h4>
            <p>Receive updates via email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Push Notifications</h4>
            <p>Browser notifications for important updates</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Forum Notifications</h4>
            <p>Get notified about forum replies and mentions</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.forum}
              onChange={(e) => handleInputChange('notifications', 'forum', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Course Updates</h4>
            <p>Notifications about new courses and updates</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.courses}
              onChange={(e) => handleInputChange('notifications', 'courses', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const PrivacySettings = () => (
    <div className="settings-section">
      <h3>Privacy Settings</h3>
      
      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Public Profile</h4>
            <p>Make your profile visible to other users</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.profileVisible}
              onChange={(e) => handleInputChange('privacy', 'profileVisible', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Show Learning Progress</h4>
            <p>Display your learning progress to others</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.showProgress}
              onChange={(e) => handleInputChange('privacy', 'showProgress', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Show Achievements</h4>
            <p>Display your achievements on your profile</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.showAchievements}
              onChange={(e) => handleInputChange('privacy', 'showAchievements', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const PreferenceSettings = () => (
    <div className="settings-section">
      <h3>Preferences</h3>
      
      <div className="form-group">
        <label>Theme</label>
        <select
          value={settings.preferences.theme}
          onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="form-group">
        <label>Language</label>
        <select
          value={settings.preferences.language}
          onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="form-group">
        <label>Timezone</label>
        <select
          value={settings.preferences.timezone}
          onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="PST">Pacific Time</option>
          <option value="GMT">Greenwich Mean Time</option>
        </select>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}

          <div className="settings-actions">
            <button className="save-btn" onClick={handleSave}>
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;