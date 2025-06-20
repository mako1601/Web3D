import * as React from "react";
import { Radio, RadioGroup, FormControlLabel, Box, Typography, Checkbox, TextField, Paper } from "@mui/material";
import { MatchingTask, QuestionForCreate, UserAnswer } from "@mytypes/testTypes";
import { gray, green } from "@theme/themePrimitives";

interface Props {
  question: QuestionForCreate;
  answer: UserAnswer;
  updateQuestion: (q: QuestionForCreate) => void;
  updateAnswer: (a: UserAnswer) => void;
}

export default function PassTestQuestion({ question, answer, updateQuestion, updateAnswer }: Props) {
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<number | null>(null);

  const handleSelectLeft = (index: number) => {
    if (selectedLeft === index) {
      setSelectedLeft(null);
    } else if (selectedRight !== null) {
      if (answer.type !== 2) return;

      const questionPairs = [...(question.task as MatchingTask).answer];
      const userPairs = [...answer.task.answer];
      const newValue = questionPairs[selectedRight][1];

      const conflictingIndex = userPairs.findIndex(
        ([, right], i) => i !== index && right === newValue
      );

      if (conflictingIndex !== -1) {
        userPairs[conflictingIndex][1] = "";
      }

      const tmp = questionPairs[index][1];
      questionPairs[index][1] = questionPairs[selectedRight][1];
      questionPairs[selectedRight][1] = tmp;

      userPairs[index][1] = questionPairs[index][1];

      const completed = isMatchingCompleted(userPairs);

      updateQuestion({ ...question, task: { ...question.task, answer: questionPairs } } as QuestionForCreate);
      updateAnswer({ ...answer, task: { ...answer.task, answer: userPairs }, isCompleted: completed });

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
      if (answer.type !== 2) return;

      const questionPairs = [...(question.task as MatchingTask).answer];
      const userPairs = [...answer.task.answer];
      const newValue = questionPairs[index][1];

      const conflictingIndex = userPairs.findIndex(
        ([, right], i) => i !== selectedLeft && right === newValue
      );

      if (conflictingIndex !== -1) {
        userPairs[conflictingIndex][1] = "";
      }

      const tmp = questionPairs[selectedLeft][1];
      questionPairs[selectedLeft][1] = questionPairs[index][1];
      questionPairs[index][1] = tmp;

      userPairs[selectedLeft][1] = questionPairs[selectedLeft][1];

      const completed = isMatchingCompleted(userPairs);

      updateQuestion({ ...question, task: { ...question.task, answer: questionPairs } } as QuestionForCreate);
      updateAnswer({ ...answer, task: { ...answer.task, answer: userPairs }, isCompleted: completed });

      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(index);
    }
  };

  function isMatchingCompleted(pairs: [string, string][]) {
    return pairs.every(([, right]) => right.trim() !== "");
  }

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
        gap: 2,
        maxWidth: '600px',
        alignSelf: 'center'
      }}
    >
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="question"
          style={{ maxWidth: '600px', maxHeight: '300px', width: 'auto', height: 'auto' }}
        />
      )}

      <Typography variant="h6" textAlign="center" sx={{ wordBreak: 'break-word', }}>
        {question.text}
      </Typography>

      {/* Один правильный ответ */}
      {question.type === 0 && (
        <RadioGroup
          value={question.task.answer.indexOf(true)}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const updatedAnswers = question.task.answer.map((_, index) => index === selectedId);
            updateQuestion({ ...question, task: { ...question.task, answer: updatedAnswers } });
            updateAnswer({
              ...answer,
              task: { ...answer.task, answer: updatedAnswers },
              isCompleted: updatedAnswers.some(Boolean),
            } as UserAnswer);
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              maxWidth: '500px',
            }}
          >
            {question.task.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                sx={{
                  display: 'flex',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  justifySelf: 'start',
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            maxWidth: '500px'
          }}
        >
          {question.task.options.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={question.task.answer[index]}
                  onChange={(e) => {
                    const updatedAnswers = [...question.task.answer];
                    updatedAnswers[index] = e.target.checked;
                    updateQuestion({ ...question, task: { ...question.task, answer: updatedAnswers } });
                    updateAnswer({
                      ...answer,
                      task: { ...answer.task, answer: updatedAnswers },
                      isCompleted: updatedAnswers.some(Boolean),
                    } as UserAnswer);
                  }}
                />
              }
              label={option}
              sx={{
                display: 'flex',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                textAlign: 'left',
                justifySelf: 'start',
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
            {question.task.answer.map((text, index) => {
              return (
                <Paper
                  key={index}
                  sx={{
                    padding: 2,
                    margin: 1,
                    cursor: 'pointer',
                    backgroundColor:
                      (answer.task.answer as [string, string][])[index][1] !== ""
                        ? (theme) => theme.palette.mode === 'dark' ? green[700] : green[200]
                        : (theme) => theme.palette.mode === 'dark' ? gray[700] : 'white',
                    border:
                      selectedLeft === index
                        ? (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)'
                        : '1px solid transparent'
                  }}
                  onClick={() => handleSelectLeft(index)}
                >
                  <Typography>{text[0]}</Typography>
                </Paper>
              );
            })}
          </Box>

          {/* Правый столбец */}
          <Box>
            {question.task.answer.map((text, index) => {
              return (
                <Paper
                  key={index}
                  sx={{
                    padding: 2,
                    margin: 1,
                    cursor: 'pointer',
                    backgroundColor:
                      (answer.task.answer as [string, string][])[index][1] !== ""
                        ? (theme) => theme.palette.mode === 'dark' ? green[700] : green[200]
                        : (theme) => theme.palette.mode === 'dark' ? gray[700] : 'white',
                    border:
                      selectedRight === index
                        ? (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)'
                        : '1px solid transparent'
                  }}
                  onClick={() => handleSelectRight(index)}
                >
                  <Typography>{text[1]}</Typography>
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
          defaultValue={question.task.answer}
          onChange={(e) => {
            const value = e.target.value.trim();
            updateQuestion({ ...question, task: { answer: value } });
            updateAnswer({
              ...answer,
              task: { ...answer.task, answer: value },
              isCompleted: value.length > 0 && !/\s/.test(value),
            } as UserAnswer);
          }}
        />
      )}
    </Box >
  );
}
