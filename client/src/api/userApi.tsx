import { api } from './axiosInstance';
import { PageResult } from '@mytypes/commonTypes';
import { ChangeUserRole, UpdUserData, UpdUserPass, UserDto } from '@mytypes/userTypes';

const ROUTE = "/users";

export const getUserById = async (id: number): Promise<UserDto> => {
  const response = await api.get<UserDto>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllUsers = async (
  name: string,
  orderBy: string,
  sortDirection: number,
  currentPage: number,
  pageSize: number
): Promise<PageResult<UserDto>> => {
  const response = await api.get<PageResult<UserDto>>(`${ROUTE}`, {
    params: { name, orderBy, sortDirection, currentPage, pageSize }
  });
  return response.data;
};

export const updateUser = async (data: UpdUserData): Promise<void> => {
  await api.put(`${ROUTE}`, data);
};

export const updatePassword = async (data: UpdUserPass): Promise<void> => {
  await api.put(`${ROUTE}/update-password`, data);
};

export const changeRole = async (data: ChangeUserRole): Promise<void> => {
  await api.put(`${ROUTE}/change-role`, data);
};