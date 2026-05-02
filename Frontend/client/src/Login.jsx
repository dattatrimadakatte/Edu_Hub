import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { authAPI } from './services/api';
import './Login.css';

const Login = ({ onLogin, onSwitchToSignUp, onSwitchToAdmin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await authAPI.login(formData.email, formData.password);
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
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <BookOpen size={32} color="#667eea" />
          </div>
          <h1>EduHub</h1>
          <p>Welcome back! Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="role-selector">
            <label className={`role-option ${formData.role === 'student' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={formData.role === 'student'}
                onChange={handleChange}
              />
              <User size={20} />
              Student
            </label>
            <label className={`role-option ${formData.role === 'instructor' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="instructor"
                checked={formData.role === 'instructor'}
                onChange={handleChange}
              />
              <User size={20} />
              Teacher
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : `Sign In as ${formData.role === 'student' ? 'Student' : 'Teacher'}`}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#" onClick={onSwitchToSignUp}>Sign up</a></p>
          <p><a href="#" onClick={onSwitchToAdmin}>Admin Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;