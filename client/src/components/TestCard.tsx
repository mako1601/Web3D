import * as React from 'react';
import { Box, Typography } from '@mui/material';

import { Test } from '@mytypes/testTypes';
import { getUserById } from "@api/userApi";
import { formatDate } from "@utils/dateUtils";

interface TestCardProps {
  test: Test;
  onClick: () => void;
}

const TestCard = ({ test, onClick }: TestCardProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);

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

  const isLongText = React.useMemo(() => test.description.split("\n").length > 3, [test.description]);

  const authorName = React.useMemo(() => {
    return author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…";
  }, [author]);

  const handleDescriptionClick = () => {
    if (isLongText) {
      setExpanded(!expanded);
    } else {
      onClick();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
        backgroundColor: hovered ? '#f0f0f0' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ padding: '1rem', cursor: 'pointer' }} onClick={onClick}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
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
              {test.updatedAt ? "Обновлено" : "Создано"}: {test.updatedAt ? formatDate(test.updatedAt) : formatDate(test.createdAt)}
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
          {!expanded && isLongText && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3rem',
                background: 'linear-gradient(transparent, grey)',
                borderRadius: '8px',
              }}
            />
          )}
        </Box>
      )}
    </div>
  );
};

export default TestCard;