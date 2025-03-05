import { api } from './axiosInstance';
import { PageResult } from '@mytypes/commonTypes';
import { Test, TestDto } from '@mytypes/testTypes';

const ROUTE = "/tests";

export const createTest = async (data: TestDto): Promise<void> => {
  await api.post(`${ROUTE}`, data);
};

export const getTestById = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllTests = async (
  searchText: string,
  orderBy: string,
  sortDirection: number,
  currentPage: number,
  pageSize: number
): Promise<PageResult<Test>> => {
  const response = await api.get<PageResult<Test>>(`${ROUTE}`, {
    params: { searchText, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

// TODO: ДОДЕЛАТЬ //
export const updateTest = async (id: number, data: TestDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}`, data);
};

export const deleteTest = async (id: number): Promise<void> => {
  await api.delete(`${ROUTE}/${id}`);
};
// -------------- //