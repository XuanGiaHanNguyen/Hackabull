import axios from 'axios';

// Hard-code the API URL if env variable is not working
// const API_URL = 'http://localhost:3000/api';

// Or use the environment variable with a fallback
const API_URL = 'http://localhost:3000/api';

// Log the API URL to verify what's being used
console.log('API URL being used:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // This allows cookies if you're using sessions
});

// Add interceptors for token handling if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Posts API endpoints with error handling
export const getPosts = async () => {
  try {
    console.log('Fetching posts from:', `${API_URL}/posts`);
    const response = await api.get('/posts');
    console.log('Posts fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Re-throw to let the component handle it
    throw error;
  }
};

export const getPostById = (id) => api.get(`/posts/${id}`);

export const createPost = (formData) => {
  // Using FormData for file uploads
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Auth endpoints if needed
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/user');

export default api;