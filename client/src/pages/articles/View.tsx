import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import ContentContainer from '@components/ContentContainer';
import { getArticleById } from '@api/articleApi';
import { getUserById } from '@api/userApi';
import { formatDate } from '@utils/dateUtils';
import { Article } from '../../types/articleTypes';

export default function ViewArticle() {
  const { id } = ReactDOM.useParams();
  const articleId = Number(id);
  const [article, setArticle] = React.useState<Article | null>(null);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);

  React.useEffect(() => {
    if (isNaN(articleId)) return;
    console.error("Оптимизировать запросы!");
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(articleId);
        setArticle(data);
        if (data.userId) {
          const userData = await getUserById(data.userId);
          setAuthor(userData);
        }
      } catch (error) {
        console.error("Ошибка загрузки статьи: ", error);
      }
    };
    fetchArticle();
  }, [articleId]);

  if (!article) {
    return (
      <Page>
        <Header />
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
        <Footer />
      </Page>
    );
  }

  return (
    <Page>
      <Header />
      <ContentContainer>
        <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" color="text.primary">
              {article.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography
                sx={{ cursor: 'pointer' }}
                color="text.primary"
                onClick={() => author && console.log(`ID автора: ${article.userId}`)}
              >
                {author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…"}
              </Typography>
              <Typography variant="caption" color="text.primary">
                {article.updatedAt ? "Обновлено" : "Создано"}: {article.updatedAt ? formatDate(article.updatedAt) : formatDate(article.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
            {article.content}
          </Typography>
        </PageCard>
      </ContentContainer>
      <Footer />
    </Page>
  );
}