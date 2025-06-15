export interface Article {
  id: number;
  userId: number;
  title: string;
  description?: string;
  contentUrl: string;
  createdAt: string;
  updatedAt?: string;
  relatedTestId?: number | null;
}

export interface ArticleDto {
  title: string;
  description?: string;
  contentUrl: string;
  relatedTestId?: number | null;
}

export interface ArticleForSchemas {
  title: string;
  description?: string;
  content: string;
  relatedTestId?: number | null;
}

export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 250;
export const CONTENT_MAX_LENGTH = 30000;