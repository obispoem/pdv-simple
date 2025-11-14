import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);