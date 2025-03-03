import { api } from './axiosInstance';
import { LogData, RegData } from '../types/userTypes';

const ROUTE = "/auth";

export const registerUser = async (data: RegData) => {
  const response = await api.post(`${ROUTE}/register`, data);
  return response.data;
};

export const loginUser = async (data: LogData) => {
  const response = await api.post(`${ROUTE}/login`, data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post(`${ROUTE}/logout`);
  return response.data;
};