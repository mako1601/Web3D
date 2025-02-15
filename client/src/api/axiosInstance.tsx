import axios from 'axios';

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
    return response.data;
  } catch (e) {
    console.error("Ошибка обновления токена", e);
    throw e;
  }
};

// Добавляем interceptor для автоматического обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Флаг, чтобы не зациклиться
      try {
        // В данном случае просто пытаемся обновить токен
        await refreshToken(); // Этот запрос автоматически обновит куки
        return api(originalRequest); // Повторяем оригинальный запрос
      } catch (refreshError) {
        console.error("Не удалось обновить токен", refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);