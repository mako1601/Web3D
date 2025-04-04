import { api } from './axiosInstance';
import { PageResult } from '@mytypes/commonTypes';
import { Test, TestDto, TestResult } from '@mytypes/testTypes';

const ROUTE = "/tests";

export const createTest = async (data: TestDto): Promise<void> => {
  await api.post(`${ROUTE}`, data);
};

export const getTestById = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllTests = async ({
  searchText,
  userId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize,
}: {
  searchText?: string,
  userId?: number,
  orderBy?: string,
  sortDirection?: number,
  currentPage?: number,
  pageSize?: number
}): Promise<PageResult<Test>> => {
  const response = await api.get<PageResult<Test>>(`${ROUTE}`, {
    params: { searchText, userId, orderBy, sortDirection, currentPage, pageSize }
  });
  return response.data;
};

export const updateTest = async (id: number, data: TestDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}`, data);
};

export const deleteTest = async (id: number): Promise<void> => {
  await api.delete(`${ROUTE}/${id}`);
};

export const startTest = async (id: number): Promise<number> => {
  const response = await api.get<number>(`${ROUTE}/${id}/start`);
  return response.data;
};

export const finishTest = async (id: number, data: TestDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}/finish`, data);
};

export const getTestForPassingById = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`${ROUTE}/${id}/pass`);
  return response.data;
};

export const getTestResultById = async (id: number): Promise<TestResult> => {
  const response = await api.get<TestResult>(`${ROUTE}/${id}/result`);
  return response.data;
};

export const getAllTestResults = async ({
  testId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize,
}: {
  testId?: number,
  orderBy?: string,
  sortDirection?: number,
  currentPage?: number,
  pageSize?: number
}): Promise<PageResult<TestResult>> => {
  const response = await api.get<PageResult<TestResult>>(`${ROUTE}/results`, {
    params: { testId, orderBy, sortDirection, currentPage, pageSize }
  });
  return response.data;
};