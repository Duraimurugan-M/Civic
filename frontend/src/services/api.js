import axios from 'axios';
import NProgress from 'nprogress';

NProgress.configure({
  minimum: 0.15,
  easing: 'ease',
  speed: 300,
  trickle: true,
  trickleSpeed: 400,
  showSpinner: false,
});

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

let activeRequests = 0;

const startProgress = () => {
  if (activeRequests === 0) NProgress.start();
  activeRequests++;
};

const stopProgress = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) NProgress.done();
};

const isSilent = (config) => {
  // If the request has _silent param, do not show progress bar
  return config?.params?._silent === true;
};

api.interceptors.request.use(
  config => {
    if (!isSilent(config)) {
      startProgress();
    }
    // Remove _silent from actual request params so it is not sent to backend
    if (config.params?._silent !== undefined) {
      const { _silent, ...rest } = config.params;
      config.params = rest;
    }
    return config;
  },
  error => {
    stopProgress();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    if (!isSilent(response.config)) {
      stopProgress();
    }
    return response;
  },
  error => {
    if (!isSilent(error.config)) {
      stopProgress();
    }
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register:          d => api.post('/auth/register', d),
  login:             d => api.post('/auth/login', d),
  logout:            () => api.post('/auth/logout'),
  getMe:             () => api.get('/auth/me'),
  updateProfile:     d => api.put('/auth/profile', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateFullProfile: d => api.put('/auth/full-profile', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword:    d => api.put('/auth/change-password', d),
};

export const complaintAPI = {
  getAll:         p       => api.get('/complaints', { params: p }),
  getById:        id      => api.get('/complaints/' + id),
  create:         d       => api.post('/complaints', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus:   (id, d) => api.put('/complaints/' + id + '/status', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  support:        id      => api.post('/complaints/' + id + '/support'),
  getMap:         ()      => api.get('/complaints/map'),
  checkDuplicate: d       => api.post('/complaints/check-duplicate', d),
  delete:         id      => api.delete('/complaints/' + id),
};

export const notificationAPI = {
  getAll:      p  => api.get('/notifications', { params: p }),
  markRead:    id => api.put('/notifications/' + id + '/read'),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const departmentAPI = {
  getAll:  ()      => api.get('/departments'),
  create:  d       => api.post('/departments', d),
  update:  (id, d) => api.put('/departments/' + id, d),
  delete:  id      => api.delete('/departments/' + id),
};

export const userAPI = {
  getAll:      p       => api.get('/users', { params: p }),
  getById:     id      => api.get('/users/' + id),
  createStaff: d       => api.post('/users/create-staff', d),
  update:      (id, d) => api.put('/users/' + id, d),
  delete:      id      => api.delete('/users/' + id),
};

export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

export const feedbackAPI = {
  submit: (id, d) => api.post('/feedback/' + id, d),
  get:    id      => api.get('/feedback/' + id),
};
