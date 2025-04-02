import * as React from "react";
import { Radio, RadioGroup, FormControlLabel, Box, Typography, Checkbox, TextField, Paper } from "@mui/material";
import { Question } from "@mytypes/testTypes";

interface Props {
  question: Question;
  updateQuestion: (q: Question) => void;
}

export default function PassTestQuestion({ question, updateQuestion }: Props) {
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<number | null>(null);

  const handleSelectLeft = (index: number) => {
    if (selectedLeft === index) {
      setSelectedLeft(null);
    } else if (selectedRight !== null) {
      const updatedOptions = [...question.answerOptions];
      let tmp = updatedOptions[selectedRight].matchingPair;
      updatedOptions[selectedRight].matchingPair = updatedOptions[index].matchingPair;
      updatedOptions[index].matchingPair = tmp;
  
      updateQuestion({
        ...question,
        answerOptions: updatedOptions,
      });
  
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft(index);
    }
  };

  const handleSelectRight = (index: number) => {
    if (selectedRight === index) {
      setSelectedRight(null);
    } else if (selectedLeft !== null) {
      const updatedOptions = [...question.answerOptions];
      let tmp = updatedOptions[selectedLeft].matchingPair;
      updatedOptions[selectedLeft].matchingPair = updatedOptions[index].matchingPair;
      updatedOptions[index].matchingPair = tmp;
  
      updateQuestion({
        ...question,
        answerOptions: updatedOptions,
      });
  
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(index);
    }
  };

  React.useEffect(() => {
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [question.id]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="question"
          style={{ maxWidth: '600px', maxHeight: '300px', width: 'auto', height: 'auto' }}
        />
      )}

      <Typography variant="h6" textAlign="center" sx={{ wordBreak: "break-word", }}>
        {question.text}
      </Typography>

      {/* Один правильный ответ */}
      {question.type === 0 && (
        <RadioGroup
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            updateQuestion({
              ...question,
              answerOptions: question.answerOptions.map((option) => ({
                ...option,
                isCorrect: option.id === selectedId,
              })),
            });
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              maxWidth: "500px"
            }}
          >
            {question.answerOptions.map((option, index) => (
              <FormControlLabel
                key={option.id}
                value={String(option.id)}
                control={<Radio />}
                label={option.text}
                sx={{
                  display: "flex",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  textAlign: index % 2 === 0 ? "left" : "center",
                  justifySelf: index % 2 === 0 ? "start" : "center",
                }}
              />
            ))}
          </Box>
        </RadioGroup>
      )}

      {/* Несколько правильных ответов */}
      {question.type === 1 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            maxWidth: "500px"
          }}
        >
          {question.answerOptions.map((option, index) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={option.isCorrect}
                  onChange={(e) => {
                    updateQuestion({
                      ...question,
                      answerOptions: question.answerOptions.map((o) =>
                        o.id === option.id ? { ...o, isCorrect: e.target.checked } : o
                      ),
                    });
                  }}
                />
              }
              label={option.text}
              sx={{
                display: "flex",
                wordBreak: "break-word",
                whiteSpace: "normal",
                textAlign: index % 2 === 0 ? "left" : "center",
                justifySelf: index % 2 === 0 ? "start" : "center",
              }}
            />
          ))}
        </Box>
      )}

      {/* Соответствие */}
      {question.type === 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 4 }}>
          {/* Левый столбец */}
          <Box>
            {question.answerOptions.map((option, index) => {
              return (
                <Paper
                  key={index}
                  sx={{
                    padding: 2,
                    margin: 1,
                    cursor: "pointer",
                    backgroundColor: "white",
                    border: selectedLeft === index ? "2px solid rgba(125, 125, 125, 0.5)" : "2px solid transparent"
                  }}
                  onClick={() => handleSelectLeft(index)}
                >
                  <Typography>{option.text}</Typography>
                </Paper>
              );
            })}
          </Box>

          {/* Правый столбец */}
          <Box>
            {question.answerOptions.map((option, index) => {
              return (
                <Paper
                  key={index}
                  sx={{
                    padding: 2,
                    margin: 1,
                    cursor: "pointer",
                    backgroundColor: "white",
                    border: selectedRight === index ? "2px solid rgba(125, 125, 125, 0.5)" : "2px solid transparent"
                  }}
                  onClick={() => handleSelectRight(index)}
                >
                  <Typography>{option.matchingPair}</Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Заполнение пропуска */}
      {question.type === 3 && (
        <TextField
          fullWidth
          defaultValue={question.correctAnswer}
          onChange={(e) => {
            updateQuestion({ ...question, correctAnswer: e.target.value })
          }}
        />
      )}
    </Box>
  );
}
