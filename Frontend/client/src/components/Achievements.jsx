import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Target, Zap, BookOpen, Calculator } from 'lucide-react';
import { achievementAPI } from '../services/api';
import './Achievements.css';

const Achievements = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completedCourses: 0,
    inProgressCourses: 0,
    totalCertificates: 0,
    completionPercentage: 0,
    totalPoints: 0
  });

  useEffect(() => {
    fetchAchievements();
    calculateUserStats();
  }, [user]);

  const calculateUserStats = () => {
    // Mock data - in real app, this would come from API
    const mockStats = {
      completedCourses: 5,
      inProgressCourses: 3,
      totalCertificates: 5,
      completionPercentage: 62,
      totalPoints: 450
    };
    setUserStats(mockStats);
  };

  const fetchAchievements = async () => {
    try {
      const allAchievements = await achievementAPI.getAllAchievements();
      const userAchievementData = await achievementAPI.getUserAchievements(user.id);
      
      const achievementsWithStatus = allAchievements.map(achievement => {
        const userAchievement = userAchievementData.find(ua => ua.achievement_id === achievement.id);
        return {
          ...achievement,
          earned: !!userAchievement,
          earnedAt: userAchievement?.earned_at,
          progress: userAchievement ? 100 : Math.floor(Math.random() * 80) // Mock progress
        };
      });
      
      setAchievements(achievementsWithStatus);
      setUserAchievements(achievementsWithStatus.filter(a => a.earned));
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      // Enhanced mock data based on course completion
      const mockAchievements = [
        {
          id: 1,
          name: "First Steps",
          description: "Complete your first course",
          icon: "🎯",
          points: 50,
          earned: userStats.completedCourses > 0,
          earnedAt: "2024-01-15",
          progress: userStats.completedCourses > 0 ? 100 : 0
        },
        {
          id: 2,
          name: "Certificate Collector",
          description: "Earn 3 certificates",
          icon: "🏆",
          points: 100,
          earned: userStats.totalCertificates >= 3,
          earnedAt: userStats.totalCertificates >= 3 ? "2024-02-10" : null,
          progress: Math.min((userStats.totalCertificates / 3) * 100, 100)
        },
        {
          id: 3,
          name: "Learning Streak",
          description: "Study for 7 consecutive days",
          icon: "🔥",
          points: 75,
          earned: false,
          progress: 85
        },
        {
          id: 4,
          name: "Course Master",
          description: "Complete 5 courses",
          icon: "📚",
          points: 200,
          earned: userStats.completedCourses >= 5,
          earnedAt: userStats.completedCourses >= 5 ? "2024-03-01" : null,
          progress: Math.min((userStats.completedCourses / 5) * 100, 100)
        },
        {
          id: 5,
          name: "Point Collector",
          description: "Earn 500 learning points",
          icon: "⭐",
          points: 150,
          earned: userStats.totalPoints >= 500,
          progress: Math.min((userStats.totalPoints / 500) * 100, 100)
        }
      ];
      setAchievements(mockAchievements);
      setUserAchievements(mockAchievements.filter(a => a.earned));
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = userAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;

  if (loading) return <div className="loading">Loading achievements...</div>;

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div>
          <h1>Achievements</h1>
          <p>Track your learning milestones and earn rewards</p>
        </div>
        <div className="points-display">
          <Calculator size={24} />
          <span className="points-text">{totalPoints} Points</span>
        </div>
      </div>

      <div className="achievements-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{userStats.totalCertificates}</div>
            <div className="stat-label">Certificates Earned</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{userStats.inProgressCourses}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{userStats.completionPercentage}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalPoints}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>
      </div>

      <div className="achievements-sections">
        <div className="section">
          <h2>Earned Achievements ({earnedCount})</h2>
          <div className="achievements-grid">
            {userAchievements.length > 0 ? userAchievements.map(achievement => (
              <div key={achievement.id} className="achievement-card earned">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-points">+{achievement.points} points</div>
                  <div className="earned-date">Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</div>
                </div>
                <div className="earned-badge">
                  <Award size={20} />
                </div>
              </div>
            )) : (
              <div className="empty-achievements">
                <Trophy size={48} />
                <p>Complete courses to earn your first achievement!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="section">
          <h2>All Achievements ({totalCount})</h2>
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-points">+{achievement.points} points</div>
                  
                  {!achievement.earned && (
                    <div className="progress-section">
                      <div className="progress-label">Progress: {Math.round(achievement.progress)}%</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${achievement.progress}%`}}></div>
                      </div>
                    </div>
                  )}
                  
                  {achievement.earned && (
                    <div className="earned-date">Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</div>
                  )}
                </div>
                {achievement.earned && (
                  <div className="earned-badge">
                    <Award size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;