import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Trash2, Users } from 'lucide-react';
import { assignmentAPI } from '../services/api';

const TeacherAssignmentsList = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentAPI.getTeacherAssignments(user.id);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch teacher assignments:', error);
      // Mock data for demonstration
      setAssignments([
        {
          id: 1,
          title: 'React Components Exercise',
          description: 'Create a React component that displays user information.',
          due_date: '2024-02-15T23:59:00',
          points: 100,
          course_title: 'React Fundamentals',
          submissions_count: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditAssignment = (assignment) => {
    // TODO: Implement edit functionality
    alert(`Edit functionality for "${assignment.title}" will be implemented soon.`);
  };

  const handleDeleteAssignment = (assignment) => {
    if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      // TODO: Implement delete functionality
      alert(`Delete functionality for "${assignment.title}" will be implemented soon.`);
    }
  };

  if (loading) return <div className="loading">Loading assignments...</div>;

  return (
    <div className="teacher-assignments-list">
      {assignments.length === 0 ? (
        <div className="no-assignments">
          <p>No assignments created yet. Click "Add Assignment" to create your first assignment.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map(assignment => (
            <div key={assignment.id} className="teacher-assignment-card">
              <div className="assignment-header">
                <h4 className="assignment-title">{assignment.title}</h4>
                <div className="assignment-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditAssignment(assignment)}
                    title="Edit Assignment"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteAssignment(assignment)}
                    title="Delete Assignment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="assignment-details">
                <p className="assignment-course">{assignment.course_title}</p>
                <p className="assignment-description">{assignment.description}</p>
                
                <div className="assignment-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Due: {formatDate(assignment.due_date)}</span>
                  </div>
                  <div className="meta-item">
                    <span>{assignment.points} points</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{assignment.submissions_count} submissions</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsList;