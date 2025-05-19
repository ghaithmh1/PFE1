import axios from "axios";

const API_URL = "http://localhost:8080/utilisateurs/";

// Configuration de la base URL pour axios
axios.defaults.baseURL = "http://localhost:8080";

// Intercepteur pour ajouter le token JWT à chaque requête
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Déconnexion si le token est expiré
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const register = async (username, email, password) => {
  return axios.post(`${API_URL}register`, {
    username,
    email,
    password,
  });
};

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}login`, {
    email,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete axios.defaults.headers.common["Authorization"];
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const forgotPassword = async (email) => {
  return axios.post(`${API_URL}forgot-password`, { email });
};

const resetPassword = async (token, newPassword) => {
  return axios.post(`${API_URL}reset-password`, {
    token,
    newPassword,
  });
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  forgotPassword,
  resetPassword,
};

export default authService;