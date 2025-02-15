import { api } from './axiosInstance';

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getAllUsers = async (name: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number) => {
  const response = await api.get("/users", { params: { name, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

export const updateUser = async (id: number, lastName: string, firstName: string, middleName: string) => {
  const response = await api.put(`/users/${id}`, { lastName, firstName, middleName });
  return response.data;
};

export const changeRole = async (id: number, role: number) => {
  const response = await api.put(`/users/${id}/change-role`, { NewRole: role });
  return response.data;
};