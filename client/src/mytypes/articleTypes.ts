export interface Article {
  id: number;
  userId: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleDto {
  title: string;
  description: string;
  content: string;
}