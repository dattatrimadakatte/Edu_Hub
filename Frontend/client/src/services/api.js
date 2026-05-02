import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (name, email, password, role) => {
    const response = await api.post('/register', { name, email, password, role });
    return response.data;
  }
};

export const dashboardAPI = {
  getStudentDashboard: async (userId) => {
    const response = await api.get(`/dashboard/student/${userId}`);
    return response.data;
  },
  
  getTeacherDashboard: async (userId) => {
    const response = await api.get(`/dashboard/teacher/${userId}`);
    return response.data;
  }
};

export const resourceAPI = {
  createResource: async (resource) => {
    const response = await api.post('/resources', resource);
    return response.data;
  },
  
  getUserResources: async (userId) => {
    const response = await api.get(`/resources/${userId}`);
    return response.data;
  },
  
  updateResource: async (resourceId, resource) => {
    const response = await api.put(`/resources/${resourceId}`, resource);
    return response.data;
  },
  
  deleteResource: async (resourceId) => {
    const response = await api.delete(`/resources/${resourceId}`);
    return response.data;
  },
  
  getPublicResources: async () => {
    const response = await api.get('/resources/public/all');
    return response.data;
  }
};

export const adminAPI = {
  getAdminDashboard: async (userId) => {
    const response = await api.get(`/admin/dashboard/${userId}`);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle`);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }
};

export const courseAPI = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  
  getInstructorCourses: async (instructorId) => {
    const response = await api.get(`/courses/instructor/${instructorId}`);
    return response.data;
  },
  
  getStudentEnrollments: async (studentId) => {
    const response = await api.get(`/enrollments/student/${studentId}`);
    return response.data;
  },
  
  createCourse: async (course) => {
    const response = await api.post('/courses', course);
    return response.data;
  },
  
  updateCourse: async (courseId, course) => {
    const response = await api.put(`/courses/${courseId}`, course);
    return response.data;
  },
  
  deleteCourse: async (courseId, instructorId) => {
    const response = await api.delete(`/courses/${courseId}?instructor_id=${instructorId}`);
    return response.data;
  },
  
  enrollInCourse: async (enrollment) => {
    const response = await api.post('/enrollments', enrollment);
    return response.data;
  },
  
  createAssignment: async (assignment) => {
    const response = await api.post('/assignments', assignment);
    return response.data;
  },
  
  getAssignments: async (courseId) => {
    const response = await api.get(`/assignments/course/${courseId}`);
    return response.data;
  }
};

export const forumAPI = {
  getAllPosts: async () => {
    const response = await api.get('/forum/posts');
    return response.data;
  },
  
  createPost: async (post) => {
    const response = await api.post('/forum/posts', post);
    return response.data;
  },
  
  getPostReplies: async (postId) => {
    const response = await api.get(`/forum/posts/${postId}/replies`);
    return response.data;
  },
  
  createReply: async (reply) => {
    const response = await api.post('/forum/replies', reply);
    return response.data;
  },
  
  likePost: async (postId, userId) => {
    const response = await api.post(`/forum/posts/${postId}/like`, { user_id: userId });
    return response.data;
  }
};

export const achievementAPI = {
  getAllAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },
  
  getUserAchievements: async (userId) => {
    const response = await api.get(`/achievements/user/${userId}`);
    return response.data;
  },
  
  awardAchievement: async (userAchievement) => {
    const response = await api.post('/achievements/user', userAchievement);
    return response.data;
  }
};

export const assignmentAPI = {
  getStudentAssignments: async (studentId) => {
    const response = await api.get(`/assignments/student/${studentId}`);
    return response.data;
  },
  
  getTeacherAssignments: async (teacherId) => {
    const response = await api.get(`/assignments/teacher/${teacherId}`);
    return response.data;
  },
  
  submitAssignment: async (submissionData) => {
    const response = await api.post('/assignments/submit', submissionData);
    return response.data;
  },
  
  gradeAssignment: async (submissionId, grade, feedback) => {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, {
      grade,
      feedback
    });
    return response.data;
  }
};

export const scheduleAPI = {
  getWeeklySchedule: async () => {
    const response = await api.get('/schedule/weekly');
    return response.data;
  },
  
  createScheduleSlot: async (slot) => {
    const response = await api.post('/schedule', slot);
    return response.data;
  },
  
  updateScheduleSlot: async (slotId, slot) => {
    const response = await api.put(`/schedule/${slotId}`, slot);
    return response.data;
  },
  
  deleteScheduleSlot: async (slotId) => {
    const response = await api.delete(`/schedule/${slotId}`);
    return response.data;
  }
};

export default api;