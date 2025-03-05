import { api } from './axiosInstance';
import { PageResult } from '@mytypes/commonTypes';
import { Article, ArticleDto } from '@mytypes/articleTypes';

const ROUTE = "/articles";

export const createArticle = async (data: ArticleDto): Promise<void> => {
  await api.post(`${ROUTE}`, data);
};

export const getArticleById = async (id: number): Promise<Article> => {
  const response = await api.get<Article>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllArticles = async (
  searchText: string,
  orderBy: string,
  sortDirection: number,
  currentPage: number,
  pageSize: number
): Promise<PageResult<Article>> => {
  const response = await api.get<PageResult<Article>>(`${ROUTE}`, {
    params: { searchText, orderBy, sortDirection, currentPage, pageSize }
  });
  return response.data;
};

export const updateArticle = async (id: number, data: ArticleDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}`, data);
};

export const deleteArticle = async (id: number): Promise<void> => {
  await api.delete(`${ROUTE}/${id}`);
};