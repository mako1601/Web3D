import { api } from './axiosInstance';
import { ArticleDto } from '../types/articleTypes';

const ROUTE = "/articles";

export const createArticle = async (data: ArticleDto) => {
  const response = await api.post(`${ROUTE}`, data);
  return response.data;
};

export const getArticleById = async (id: number) => {
  const response = await api.get(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllArticles = async (searchText: string, orderBy: string, sortDirection: number, currentPage: number, pageSize: number) => {
  const response = await api.get(`${ROUTE}`, { params: { searchText, orderBy, sortDirection, currentPage, pageSize } });
  return response.data;
};

export const updateArticle = async (id: number, data: ArticleDto) => {
  const response = await api.put(`${ROUTE}/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: number) => {
  const response = await api.delete(`${ROUTE}/${id}`);
  return response.data;
};