import axios from 'axios';

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función para obtener el token desde localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Token global - se actualiza dinámicamente
let authToken = getAuthToken();

// Función para actualizar el token global
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Crear instancia de Axios
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada solicitud
httpClient.interceptors.request.use((config) => {
  // Siempre obtener el token más reciente de localStorage
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si no estamos ya en la página de login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !currentPath.includes('/login')) {
        // Limpiar token y redirigir al login
        setAuthToken(null);
        localStorage.removeItem('currentUser');
        // Solo redirigir si no estamos en el proceso de login
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);
