import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/users/login', { username: email, password }),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
};

export const policyService = {
  getPolicies: () => api.get('/policies/'),
  createPolicy: (policyData) => api.post('/policies/', policyData),
};

export const claimService = {
  getClaims: () => api.get('/claims/'),
  createClaim: (claimData) => api.post('/claims/', claimData),
};

export const documentService = {
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 