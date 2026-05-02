import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Shield } from 'lucide-react';
import { authAPI } from './services/api';
import './Login.css';

const AdminLogin = ({ onLogin, onSwitchToUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await authAPI.login(formData.email, formData.password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        return;
      }
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-card admin-card">
        <div className="login-header">
          <div className="logo admin-logo">
            <Shield size={32} color="#dc2626" />
          </div>
          <h1>EduHub Admin</h1>
          <p>Administrator Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Admin Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn admin-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Admin Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Not an admin? <a href="#" onClick={onSwitchToUser}>User Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;