import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5206/api', // Backend runs on port 5206
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data; // Return the data directly for cleaner component code
  },
  (error) => {
    if (error.response && error.response.status === 401) {
       // Optional: Handle unauthorized access (e.g., clear token and redirect)
       // localStorage.removeItem('token');
       // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Exam API
export const examApi = {
  getAll: () => api.get('/exam'),
  getById: (id) => api.get(`/exam/${id}`),
  getMy: () => api.get('/exam/my'),
  getActive: () => api.get('/exam/active'),
  create: (data) => api.post('/exam', data),
  update: (id, data) => api.put(`/exam/${id}`, data),
  delete: (id) => api.delete(`/exam/${id}`),
  activate: (id) => api.post(`/exam/${id}/activate`),
  deactivate: (id) => api.post(`/exam/${id}/deactivate`),
  // Student exam actions
  start: (id) => api.post(`/exam/${id}/start`),
  submit: (id, data) => api.post(`/exam/${id}/submit`, data),
  getResult: (id) => api.get(`/exam/${id}/result`),
  getMyAttempts: (id) => api.get(`/exam/${id}/attempts`),
  // Question management for exam
  addQuestions: (examId, questionsData) => api.post(`/exam/${examId}/questions`, { questions: questionsData }),
  removeQuestion: (examId, questionId) => api.delete(`/exam/${examId}/questions/${questionId}`),
  getQuestions: (examId) => api.get(`/exam/${examId}/questions`),
  // Publish/Draft
  publish: (id) => api.post(`/exam/${id}/publish`),
  saveDraft: (id) => api.post(`/exam/${id}/draft`),
  // Create from matrix
  createFromMatrix: (data) => api.post('/exam/from-matrix', data),
};

// Exam Matrix API
export const examMatrixApi = {
  getAll: () => api.get('/exam-matrix'),
  getById: (id) => api.get(`/exam-matrix/${id}`),
  getMy: () => api.get('/exam-matrix/my'),
  create: (data) => api.post('/exam-matrix', data),
  update: (id, data) => api.put(`/exam-matrix/${id}`, data),
  delete: (id) => api.delete(`/exam-matrix/${id}`),
  preview: (data) => api.post('/exam-matrix/preview', data),
};

// Lesson Plan API
export const lessonPlanApi = {
  getAll: () => api.get('/lesson-plan'),
  getById: (id) => api.get(`/lesson-plan/${id}`),
  getMy: () => api.get('/lesson-plan/my'),
  create: (data) => api.post('/lesson-plan', data),
  update: (id, data) => api.put(`/lesson-plan/${id}`, data),
  delete: (id) => api.delete(`/lesson-plan/${id}`),
};

// Question Bank API
export const questionBankApi = {
  getAll: () => api.get('/question-bank'),
  getById: (id) => api.get(`/question-bank/${id}`),
  getMy: () => api.get('/question-bank/my'),
  create: (data) => api.post('/question-bank', data),
  update: (id, data) => api.put(`/question-bank/${id}`, data),
  delete: (id) => api.delete(`/question-bank/${id}`),
};

// User/Profile API
export const userApi = {
  getProfile: () => api.get('/account/profile'),
  updateProfile: (data) => api.put('/account/profile', data), 
  changePassword: (data) => api.post('/account/change-password', data),
};

// Admin API
export const adminApi = {
  getAllAccounts: (params) => api.get('/admin/accounts', { params }),
  getAllAccounts: (params) => api.get('/admin/accounts', { params }),
  toggleStatus: (id) => api.post(`/admin/accounts/${id}/toggle-status`),
  createTeacher: (data) => api.post('/admin/accounts/teacher', data),
};

// Question API
export const questionApi = {
  create: (data) => api.post('/questions', data),
  getById: (id) => api.get(`/questions/${id}`),
  getByBank: (bankId, params) => api.get(`/questions/bank/${bankId}`, { params }),
  getByDifficulty: (bankId, difficulty) => api.get(`/questions/bank/${bankId}/difficulty/${difficulty}`),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// AI API
export const aiApi = {
  generateLessonPlan: (data) => api.post('/ai/lesson-plan', data),
  generateQuestions: (data) => api.post('/ai/questions', data),
};

export const dashboardApi = {
    getTeacherStats: () => api.get('/dashboard/teacher'),
    getStudentStats: () => api.get('/dashboard/student'),
    getAdminStats: () => api.get('/dashboard/admin'),
};

export default api;
