import * as React from 'react';
import { Box, Typography } from '@mui/material';

import { Test } from '@mytypes/testTypes';
import { getUserById } from '@api/userApi';
import { formatDate } from '@utils/dateUtils';
import StyledCard from './StyledCard';
import GradientBox from './GradientBox';

interface TestCardProps {
  test: Test;
}

const TestCard = ({ test }: TestCardProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);
  const [isLongText, setIsLongText] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUserById(test.userId);
        setAuthor(userData);
      } catch (error) {
        console.error("Ошибка загрузки автора: ", error);
        setAuthor(null);
      }
    };
    fetchAuthor();
  }, [test.userId]);

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
  }, [test.description]);

  const authorName = React.useMemo(() => {
    return author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…";
  }, [author]);

  const handleDescriptionClick = (e: React.MouseEvent) => {
    if (isLongText) {
      e.stopPropagation();
      e.preventDefault();
      setExpanded(prev => !prev);
    }
  };

  return (
    <StyledCard to={`/tests/${test.id}`}>
      <Box sx={{ padding: '1rem' }}>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
          }}
        >
          {test.title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Количество вопросов: {test.questions.length}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography sx={{ color: 'text.secondary' }}>
              {authorName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {"Создано: " + formatDate(test.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
      {test.description !== "" && (
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
            {test.description}
          </Typography>
          {!expanded && isLongText && <GradientBox />}
        </Box>
      )}
    </StyledCard>
  );
};

export default TestCard;