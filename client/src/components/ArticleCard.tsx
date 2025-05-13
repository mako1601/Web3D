import * as React from 'react';
import { Box, Typography } from '@mui/material';

import { getUserById } from '@api/userApi';
import { formatDate } from '@utils/dateUtils';
import { Article } from '@mytypes/articleTypes';
import GradientBox from './GradientBox';
import StyledCard from './StyledCard';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);
  const [isLongText, setIsLongText] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUserById(article.userId);
        setAuthor(userData);
      } catch (error) {
        console.error("Ошибка загрузки автора: ", error);
        setAuthor(null);
      }
    };
    fetchAuthor();
  }, [article.userId]);

  const checkTextLength = () => {
    const element = textRef.current;
    if (!element) return;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
    const maxLines = 3;
    const maxHeight = lineHeight * maxLines;
    if (element.scrollHeight > maxHeight + 1) {
      setIsLongText(true);
    } else {
      setIsLongText(false);
    }
  };

  React.useEffect(() => {
    checkTextLength();
    window.addEventListener('resize', checkTextLength);
    return () => {
      window.removeEventListener('resize', checkTextLength);
    };
  }, [article.description]);

  const handleDescriptionClick = (e: React.MouseEvent) => {
    if (isLongText) {
      e.stopPropagation();
      e.preventDefault();
      setExpanded(prev => !prev);
    }
  };

  return (
    <StyledCard to={`/articles/${article.id}`}>
      <Box sx={{ padding: '1rem', cursor: 'pointer' }}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            {author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…"}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {article.updatedAt ? "Обновлено" : "Создано"}: {article.updatedAt ? formatDate(article.updatedAt) : formatDate(article.createdAt)}
          </Typography>
        </Box>
      </Box>
      {article.description !== "" && (
        <Box
          sx={{ padding: '0 1rem 1rem 1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={handleDescriptionClick}
        >
          <Typography
            ref={textRef}
            sx={{
              color: 'text.secondary',
              whiteSpace: 'pre-line',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: expanded ? 'unset' : 3,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
              wordBreak: 'break-word',
            }}
          >
            {article.description}
          </Typography>
          {!expanded && isLongText && <GradientBox />}
        </Box>
      )}
    </StyledCard>
  );
};

export default ArticleCard;