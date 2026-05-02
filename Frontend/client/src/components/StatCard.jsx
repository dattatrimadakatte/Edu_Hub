import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, change, icon, colorClass }) => (
  <div className={`stat-card modern ${colorClass}`}>
    <div className="stat-header">
      <div className={`stat-icon ${colorClass}`}>
        {icon}
      </div>
      <div className="stat-trend positive">
        <TrendingUp size={14} />
      </div>
    </div>
    <div className="stat-content">
      <h4 className="stat-value">{value}</h4>
      <p className="stat-title">{title}</p>
      <span className="stat-change">{change}</span>
    </div>
  </div>
);

export default StatCard;