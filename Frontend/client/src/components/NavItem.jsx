import React from 'react';

const NavItem = ({ icon, label, active = false }) => (
  <div className={`nav-item ${active ? 'active' : ''}`}>
    <div className="nav-icon">{icon}</div>
    <span className="nav-label">{label}</span>
  </div>
);

export default NavItem;