import { api } from './axiosInstance';
import { UpdUserData, UpdUserPass } from '../types/userTypes';

const ROUTE = "/users";

export const getCurrentUser = async () => {
  const response = await api.get(`${ROUTE}/me`);
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllUsers = async (name: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number) => {
  const response = await api.get(`${ROUTE}`, { params: { name, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

export const updateUser = async (id: number, data: UpdUserData) => {
  const response = await api.put(`${ROUTE}/${id}`, data );
  return response.data;
};

export const changeRole = async (id: number, role: number) => {
  const response = await api.put(`${ROUTE}/${id}/change-role`, { NewRole: role });
  return response.data;
};

export const updatePassword = async (id: number, data: UpdUserPass) => {
  await api.put(`${ROUTE}/${id}/update-password`, data);
};