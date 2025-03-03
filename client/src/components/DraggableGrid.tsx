import * as React from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, Modifier } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToWindowEdges } from "@dnd-kit/modifiers";
import uuid from 'react-native-uuid';
import { Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import SortableItem from "./SortableItem";
import { QuestionForCreate } from "../api/testApi";

const MAX_ITEMS = 50;
const GRID_COLS = 10;

const DraggableGrid = ({
  questions,
  setQuestions,
  activeQuestion,
  setActiveQuestion
}: {
  questions: QuestionForCreate[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionForCreate[]>>;
  activeQuestion: string;
  setActiveQuestion: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const modifiers: Modifier[] = [restrictToParentElement, restrictToWindowEdges];

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setQuestions((prevQuestions) => {
        const oldIndex = prevQuestions.findIndex((q) => q.id === active.id);
        const newIndex = prevQuestions.findIndex((q) => q.id === over.id);
        const newOrder = arrayMove(prevQuestions, oldIndex, newIndex);
        const updatedQuestions = newOrder.map((q, index) => ({
          ...q,
          index: index
        }));
        return updatedQuestions;
      });
      setActiveQuestion(active.id);
    } else {
      setActiveQuestion(active.id);
    }
  };

  const addQuestion = () => {
    if (questions.length < MAX_ITEMS) {
      const newQuestion: QuestionForCreate = {
        id: uuid.v4(),
        index: questions.length,
        text: "",
        answerOptions: [
          { index: 0, text: "", isCorrect: true },
          { index: 1, text: "", isCorrect: false },
        ]
      };
      setQuestions([...questions, newQuestion]);
      setActiveQuestion(newQuestion.id);
    }
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      const updatedQuestions = questions
        .filter((q) => q.id !== id)
        .map((q, newIndex) => ({ ...q, index: newIndex }));
      setQuestions(updatedQuestions);
      setActiveQuestion(updatedQuestions[0].id);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={modifiers}>
      <SortableContext items={questions.map(q => q.id)} strategy={rectSortingStrategy}>
        <Grid container spacing={2} columns={GRID_COLS}>
          {questions.map((question) => (
            <SortableItem
              key={question.id}
              id={question.id}
              text={question.text}
              onRemove={() => removeQuestion(question.id)}
              activeId={activeQuestion}
              setActiveId={setActiveQuestion}
              isRemovable={questions.length > 1}
            />
          ))}
          {questions.length < MAX_ITEMS && (
            <Grid size={{ xs: 3, sm: 2, md: 1 }}>
              <Paper
                onClick={addQuestion}
                title="Добавить вопрос"
                sx={{
                  cursor: "pointer",
                  borderRadius: 1,
                  aspectRatio: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  "&:hover": { background: "rgb(234, 234, 234)" }
                }}
              >
                <AddIcon fontSize="large" />
              </Paper>
            </Grid>
          )}
        </Grid>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableGrid;