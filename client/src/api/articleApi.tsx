import { api } from './axiosInstance';

export interface ArticleDto {
  id: number;
  userId: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleData {
  title: string;
  description: string;
  content: string;
}

export const createArticle = async (data: ArticleData) => {
  const response = await api.post("/articles", data);
  return response.data;
};

export const getArticleById = async (id: number) => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

export const getAllArticles = async (searchText: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number) => {
  const response = await api.get("/articles", { params: { searchText, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

export const updateArticle = async (id: number, data: ArticleData) => {
  const response = await api.put(`/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: number) => {
  const response = await api.delete(`/articles/${id}`);
  return response.data;
};