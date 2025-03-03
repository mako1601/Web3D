import { api } from './axiosInstance';
import { PageResult } from '../types/commonTypes';
import { Test, TestDto } from '../types/testTypes';

const ROUTE = "/tests";

export const createTest = async (data: TestDto): Promise<TestDto> => {
  const response = await api.post<TestDto>(`${ROUTE}`, data);
  return response.data;
};

export const getTestById = async (id: number) => {
  const response = await api.get(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllTests = async (searchText: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number): Promise<PageResult<Test>> => {
  const response = await api.get<PageResult<Test>>(`${ROUTE}`, { params: { searchText, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

export const updateTest = async (id: number, data: TestDto) => {
  const response = await api.put(`${ROUTE}/${id}`, data);
  return response.data;
};

export const deleteTest = async (id: number) => {
  const response = await api.delete(`${ROUTE}/${id}`);
  return response.data;
};