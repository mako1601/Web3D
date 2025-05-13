import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Grid2, Paper, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { brand, gray } from '@theme/themePrimitives';

const SortableItem = ({
  id,
  text,
  onRemove,
  activeId,
  setActiveId,
  isRemovable
}: {
  id: string;
  text: string;
  onRemove: () => void;
  activeId: string;
  setActiveId: (id: string) => void;
  isRemovable: boolean;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const isActive = activeId === id;

  return (
    <Grid2 size={{ xs: 3, sm: 2, md: 1 }} ref={setNodeRef}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && !isDragging && isRemovable && (
          <IconButton
            size="small"
            title="Удалить вопрос"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            sx={(theme) => ({
              position: 'absolute',
              top: 1,
              right: 1,
              zIndex: 2,
              border: 0,
              borderRadius: 20,
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: theme.palette.mode === 'dark' ? gray[500] : gray[100],
              '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? gray[600] : gray[200] }
            })}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
        <Paper
          {...attributes}
          {...listeners}
          sx={(theme) => {
            let background, outline;

            if (isDragging) {
              if (theme.palette.mode === 'dark') {
                outline = `2px solid ${brand[700]}`;
                background = brand[800];
              } else {
                outline = `2px solid ${brand[300]}`;
                background = brand[100];
              }
            } else if (isActive) {
              outline = theme.palette.mode === 'dark'
                ? '2px solid #ffb74d'
                : '2px solid #ff9800';
              background = theme.palette.mode === 'dark'
                ? gray[700]
                : 'hsl(0, 0%, 99%)';
            } else {
              outline = 'none';
              background = theme.palette.mode === 'dark'
                ? gray[700]
                : 'hsl(0, 0%, 99%)';
            }

            return {
              transition,
              transform: CSS.Transform.toString(transform),
              outline,
              background,
              cursor: 'grab',
              userSelect: 'none',
              boxShadow: isDragging
                ? '0px 4px 10px rgba(0, 0, 0, 0.2)'
                : theme.palette.mode === 'dark'
                  ? 'none'
                  : '0px 0px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: 1,
              aspectRatio: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: isDragging ? 2 : 1,
              position: 'relative',
              width: '100%',
              height: '100%',
              pointerEvents: 'auto',
            };
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!isActive) {
              setActiveId(id);
            }
          }}
        >
          <Typography
            sx={{
              padding: '0.3rem',
              overflow: 'hidden',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
            }}
          >
            {text}
          </Typography>
        </Paper>
      </Box>
    </Grid2 >
  );
}

export default SortableItem;