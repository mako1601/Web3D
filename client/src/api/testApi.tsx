import { api } from './axiosInstance';

export interface PageResult<T> {
  data: T[];
  totalCount: number;
}

export interface TestDto {
  title: string;
  description: string;
  questions: QuestionDto[];
}

export interface QuestionDto {
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOptionDto[];
}

export interface AnswerOptionDto {
  index: number;
  text: string;
  isCorrect: boolean;
}

export interface Test {
  id: number;
  userId: number;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
}

export interface Question {
  id: number;
  testId: number;
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: number;
  questionId: number;
  index: number;
  text: string;
  isCorrect: boolean;
}

export const createTest = async (data: TestDto): Promise<TestDto> => {
  const response = await api.post<TestDto>("/tests", data);
  return response.data;
};

export const getTestById = async (id: number) => {
  const response = await api.get(`/tests/${id}`);
  return response.data;
};

export const getAllTests = async (searchText: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number): Promise<PageResult<Test>> => {
  const response = await api.get<PageResult<Test>>("/tests", { params: { searchText, orderBy, sortDirection, currentPage, pageSize } });
  console.log(response);
  return response.data;
};

export const updateTest = async (id: number, data: Test) => {
  const response = await api.put(`/tests/${id}`, data);
  return response.data;
};

export const deleteTest = async (id: number) => {
  const response = await api.delete(`/tests/${id}`);
  return response.data;
};