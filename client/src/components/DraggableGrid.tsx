import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, Modifier } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Paper, Grid2 } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import SortableItem from '@components/SortableItem';
import { QuestionMap } from '@mytypes/testTypes';
import { gray } from '@theme/themePrimitives';

const MAX_ITEMS = 50;
const GRID_COLS = 10;

const DraggableGrid = ({
  questions,
  activeQuestionId,
  setActiveQuestionId,
  handleDragEnd,
  addQuestion,
  removeQuestion
}: {
  questions: QuestionMap;
  activeQuestionId: string;
  setActiveQuestionId: (id: string) => void;
  handleDragEnd: (event: any) => void;
  addQuestion: () => void;
  removeQuestion: (id: string) => void;
}) => {
  const modifiers: Modifier[] = [restrictToParentElement, restrictToWindowEdges];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={modifiers}>
      <SortableContext items={Object.keys(questions)} strategy={rectSortingStrategy}>
        <Grid2 container spacing={2} columns={GRID_COLS}>
          {Object.keys(questions).map(key => {
            return (
              <SortableItem
                key={key}
                id={key}
                text={questions[key].text ?? ""}
                onRemove={() => removeQuestion(key)}
                activeId={activeQuestionId}
                setActiveId={setActiveQuestionId}
                isRemovable={Object.keys(questions).length > 1}
              />
            );
          })}
          {Object.keys(questions).length < MAX_ITEMS && (
            <Grid2 size={{ xs: 3, sm: 2, md: 1 }}>
              <Paper
                onClick={addQuestion}
                title="Добавить вопрос"
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  aspectRatio: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  transition: 'background 0.3s ease',
                  "&:hover": {
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? gray[700]
                        : gray[100]
                  }
                }}
              >
                <AddIcon fontSize="large" sx={{
                  color: (theme) =>
                    theme.palette.mode === 'dark'
                      ? gray[400]
                      : gray[700]
                }} />
              </Paper>
            </Grid2>
          )}
        </Grid2>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableGrid;