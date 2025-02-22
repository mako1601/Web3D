import { api } from './axiosInstance';

export interface RegData {
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  role: number;
};

export interface LogData {
  login: string;
  password: string;
};

export const registerUser = async (data: RegData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LogData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};