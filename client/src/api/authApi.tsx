import { api } from './axiosInstance';

export const registerUser = async (login: string, password: string, lastName: string, firstName: string, middleName: string, role: number) => {
  const response = await api.post("/auth/register", { login, password, lastName, firstName, middleName, role });
  return response.data;
};

export const loginUser = async (login: string, password: string) => {
  const response = await api.post("/auth/login", { login, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};