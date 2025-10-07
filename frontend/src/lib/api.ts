import axios from 'axios';

export const BASE_URL = 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dinus-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Utility function to fix image URLs
export const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '';
  
  // If the image path already includes the base URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If the image path starts with /uploads, add the base URL
  if (imagePath.startsWith('/uploads')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Otherwise, return the image path as is
  return imagePath;
};

export default api;