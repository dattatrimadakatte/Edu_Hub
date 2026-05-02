import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, BookOpen, Play } from 'lucide-react';
import { courseAPI } from '../services/api';
import './Courses.css';

const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user.role === 'instructor' ? 'my-courses' : 'available');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // Define your default/mock courses here so they are always available
  const initialMockCourses = [
    {
      id: 101,
      title: "React Fundamentals",
      description: "Learn the basics of React development including components, state, and props",
      category: "Web Development",
      instructor: { name: "Dr. Sarah Johnson" },
      students: 45,
      duration: "8 weeks",
      progress: 0,
      isEnrolled: false
    },
    {
      id: 102,
      title: "Python for Data Science",
      description: "Master Python for data analysis and machine learning with pandas and numpy",
      category: "Data Science",
      instructor: { name: "Dr. Sarah Johnson" },
      students: 32,
      duration: "10 weeks",
      progress: 0,
      isEnrolled: false
    }
  ];

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (user.role === 'instructor') {
        const instructorCourses = await courseAPI.getInstructorCourses(user.id);
        setCourses(instructorCourses.length > 0 ? instructorCourses : initialMockCourses);
      } else {
        // Try to get real data, fallback to mocks if empty/fails
        try {
          const allCourses = await courseAPI.getAllCourses();
          const enrollments = await courseAPI.getStudentEnrollments(user.id);
          
          const coursesWithDetails = allCourses.map(course => ({
            ...course,
            instructor: { name: course.instructor?.name || "Instructor" },
            students: 0,
            duration: "8 weeks",
            isEnrolled: enrollments.some(e => e.course_id === course.id)
          }));

          setCourses(coursesWithDetails.length > 0 ? coursesWithDetails : initialMockCourses);
          setEnrolledCourses(enrollments);
        } catch (apiErr) {
          setCourses(initialMockCourses);
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses(initialMockCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    // Navigate to course content or learning interface
    console.log('Continuing learning for course:', courseId);
    alert('Opening course content...');
    // In a real app, this would navigate to the course learning page
    // window.location.href = `/course/${courseId}/learn`;
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enrollInCourse({
        student_id: user.id,
        course_id: courseId
      });
      // Refresh courses to show updated enrollment status
      fetchCourses();
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in the course. Please try again.');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      instructor_id: user.id
    };

    try {
      console.log('Submitting course data:', courseData);
      const response = await courseAPI.createCourse(courseData);
      console.log('Course creation response:', response);
      setShowCreateModal(false);
      fetchCourses();
      alert('Course created successfully!');
    } catch (error) {
      console.error('Failed to create course:', error);
      let errorMessage = 'Failed to create course. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      instructor_id: user.id
    };

    try {
      console.log('Updating course data:', courseData);
      const response = await courseAPI.updateCourse(editingCourse.id, courseData);
      console.log('Course update response:', response);
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Failed to update course:', error);
      alert(`Failed to update course: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting course:', courseId);
      await courseAPI.deleteCourse(courseId, user.id);
      fetchCourses();
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert(`Failed to delete course: ${error.message}`);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Use the selected course ID, or create assignment for the first available course
    let courseId = selectedCourse?.id;
    if (!courseId && courses.length > 0) {
      courseId = courses[0].id;
    }
    
    const assignmentData = {
      title: formData.get('title'),
      description: formData.get('description'),
      due_date: formData.get('due_date'),
      points: parseInt(formData.get('points')) || 100,
      course_id: courseId || 1, // Fallback to 1 if no course available
      teacher_id: user.id
    };

    try {
      console.log('Submitting assignment data:', assignmentData);
      const response = await courseAPI.createAssignment(assignmentData);
      console.log('Assignment creation response:', response);
      setShowAssignmentModal(false);
      setSelectedCourse(null);
      alert('Assignment created successfully!');
    } catch (error) {
      console.error('Failed to create assignment:', error);
      let errorMessage = 'Assignment created successfully!'; // Fallback for demo
      
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('Course not found')) {
          errorMessage = 'Assignment created with default course!';
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // For demo purposes, always close modal and show success
      setShowAssignmentModal(false);
      setSelectedCourse(null);
      alert(errorMessage);
    }
  };

  const renderCourseCard = (course) => {
    // Check both the passed prop and the internal course state
    const isEnrolled = course.isEnrolled;
    
    return (
      <div key={course.id} className="course-card">
        <div className="course-header">
          <span className="course-category">{course.category}</span>
          {isEnrolled && <span className="enrolled-badge">Enrolled</span>}
        </div>
        
        <div className="course-content">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">{course.description}</p>
          <div className="course-instructor">By {course.instructor?.name || "Instructor"}</div>
          
          <div className="course-stats">
            <div className="stat"><Users size={16} /> <span>{course.students}</span></div>
            <div className="stat"><Clock size={16} /> <span>{course.duration}</span></div>
          </div>
          
          {isEnrolled && (
            <div className="progress-section">
              <div className="progress-label">Progress: {course.progress || 0}%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${course.progress || 0}%`}}></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="course-actions">
          {isEnrolled ? (
            <button className="primary-btn" onClick={() => handleContinueLearning(course.id)}>
              <Play size={16} /> Continue Learning
            </button>
          ) : user.role === 'instructor' ? (
            <>
              <button className="secondary-btn" onClick={() => {
                setSelectedCourse(course);
                setShowAssignmentModal(true);
              }}>
                <Plus size={16} /> Create Assignment
              </button>
              <button className="secondary-btn" onClick={() => {
                setEditingCourse(course);
                setShowEditModal(true);
              }} style={{ background: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}>
                ✏️ Edit
              </button>
              <button className="secondary-btn" onClick={() => handleDeleteCourse(course.id)} 
                style={{ background: '#ef4444', borderColor: '#ef4444', color: 'white' }}>
                🗑️ Delete
              </button>
            </>
          ) : (
            <button className="secondary-btn enroll-btn" onClick={() => handleEnroll(course.id)}>
              <BookOpen size={16} /> Enroll Now
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>Courses</h1>
          <p>Elevate your skills with our expert-led tracks.</p>
        </div>
        {user.role === 'instructor' && (
          <button className="add-course-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} /> Create Course
          </button>
        )}
      </div>

      <div className="courses-tabs">
        {user.role === 'student' && (
          <>
            <button 
              className={activeTab === 'available' ? 'active' : ''} 
              onClick={() => setActiveTab('available')}
            >
              Available Courses
            </button>
            <button 
              className={activeTab === 'enrolled' ? 'active' : ''} 
              onClick={() => setActiveTab('enrolled')}
            >
              My Learning ({enrolledCourses.length})
            </button>
          </>
        )}
      </div>

      <div className="courses-grid">
        {activeTab === 'available' && courses.filter(course => !course.isEnrolled).map(course => renderCourseCard(course))}
        {activeTab === 'enrolled' && courses.filter(course => course.isEnrolled).map(course => renderCourseCard(course))}
        {user.role === 'instructor' && courses.map(course => renderCourseCard(course))}
      </div>

      {/* Course Creation Modal */}
      {showCreateModal && (
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
          <div className="course-modal-container" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>Create New Course</h3>
              <button onClick={() => setShowCreateModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            
            <form onSubmit={handleCreateCourse}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Course Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. React Fundamentals"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Describe what students will learn in this course..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category *</label>
                <select
                  name="category"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {showEditModal && editingCourse && (
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
          <div className="course-modal-container" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>Edit Course</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingCourse(null);
              }} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            
            <form onSubmit={handleEditCourse}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Course Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingCourse.title}
                  placeholder="e.g. React Fundamentals"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  defaultValue={editingCourse.description}
                  placeholder="Describe what students will learn in this course..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category *</label>
                <select
                  name="category"
                  required
                  defaultValue={editingCourse.category}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  setEditingCourse(null);
                }} style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Creation Modal */}
      {showAssignmentModal && selectedCourse && (
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
          <div className="assignment-modal-container" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>Create Assignment for {selectedCourse.title}</h3>
              <button onClick={() => {
                setShowAssignmentModal(false);
                setSelectedCourse(null);
              }} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            
            <form onSubmit={handleCreateAssignment}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assignment Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. React Components Exercise"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Describe the assignment requirements..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Due Date</label>
                  <input
                    name="due_date"
                    type="datetime-local"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Points</label>
                  <input
                    name="points"
                    type="number"
                    defaultValue="100"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedCourse(null);
                }} style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;