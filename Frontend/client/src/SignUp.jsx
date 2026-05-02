import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, Phone } from 'lucide-react';
import { authAPI } from './services/api';
import './Login.css';

const SignUp = ({ onSignUp, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const role = formData.role === 'teacher' ? 'instructor' : 'student';
      const user = await authAPI.register(formData.name, formData.email, formData.password, role);
      onSignUp(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
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
          <h1>Join EduHub</h1>
          <p>Create your account to get started</p>
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
            <label className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={formData.role === 'teacher'}
                onChange={handleChange}
              />
              <User size={20} />
              Teacher
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Phone size={20} className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
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
                placeholder="Password"
                value={formData.password}
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
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : `Create ${formData.role === 'student' ? 'Student' : 'Teacher'} Account`}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <a href="#" onClick={onSwitchToLogin}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;