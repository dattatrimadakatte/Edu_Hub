import React, { useState } from 'react';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import Dashboard from './Dashboard.jsx';
import TeacherDashboard from './TeacherDashboard2.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const App = () => {
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignUp = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAdminLogin(false);
  };

  if (!user) {
    if (showAdminLogin) {
      return (
        <AdminLogin 
          onLogin={handleLogin} 
          onSwitchToUser={() => setShowAdminLogin(false)} 
        />
      );
    }
    
    return showSignUp ? (
      <SignUp 
        onSignUp={handleSignUp} 
        onSwitchToLogin={() => setShowSignUp(false)}
        onSwitchToAdmin={() => setShowAdminLogin(true)}
      />
    ) : (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignUp={() => setShowSignUp(true)}
        onSwitchToAdmin={() => setShowAdminLogin(true)}
      />
    );
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return user.role === 'instructor' ? 
    <TeacherDashboard user={user} onLogout={handleLogout} /> : 
    <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;