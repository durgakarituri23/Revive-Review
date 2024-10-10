// authenticate.js
import axios from 'axios';

// Set the base URL for the API
const API_URL = 'http://localhost:8000';

// Function to store the JWT token in local storage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Function to get the stored JWT token from local storage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Function to remove the JWT token (for logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;  // Returns true if token exists
};

// Function to login the user
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/token`, {
      email: email,
      password: password,
    });
    
    // If login is successful, store the token
    if (response.status === 200) {
      setToken(response.data.access_token);
      return { success: true };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { success: false, message: 'Invalid credentials' };
    } else {
      return { success: false, message: 'Login failed' };
    }
  }
};

// Function to logout the user
export const logout = () => {
  removeToken();
};

// Axios request interceptor to include the JWT token in every request
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
