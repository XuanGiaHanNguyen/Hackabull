// services/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Get all posts
export const getPosts = () => {
  return apiClient.get('/posts');
};

// Create a new post (with file upload)
export const createPost = (formData) => {
  return apiClient.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};