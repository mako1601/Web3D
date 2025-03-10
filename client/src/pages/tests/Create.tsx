import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio, Backdrop, CircularProgress, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import DraggableGrid from '@components/DraggableGrid';
import ContentContainer from '@components/ContentContainer';
import { createTest } from '@api/testApi';
import { PageProps } from '@mytypes/commonTypes';
import { TestDto, TestForSchemas } from '@mytypes/testTypes';
import { testSchema } from '@schemas/testSchemas';
import { useTestQuestions } from "@hooks/useTestQuestions";
import usePreventUnload from "@hooks/usePreventUnload";

// TODO: add question validation
export default function CreateTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = ReactDOM.useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [formDirty, setFormDirty] = React.useState(false);
  usePreventUnload(formDirty);
  const {
    questions,
    activeQuestion,
    setActiveQuestion,
    addQuestion,
    updateQuestion,
    removeQuestion,
    handleDragEnd,
    addAnswerOption,
    updateAnswerOption,
    setCorrectAnswer,
    removeAnswerOption
  } = useTestQuestions();

  const TITLE_MAX_LENGTH = 60;
  const DESCRIPTION_MAX_LENGTH = 250;
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TestForSchemas>({
    resolver: yupResolver(testSchema)
  });

  const onSubmit = async (data: TestForSchemas) => {
    try {
      setLoading(true);
      const testData: TestDto = {
        title: data.title,
        description: data.description,
        questions: Object.values(questions).map((question, qIndex) => ({
          id: question.id,
          testId: question.testId,
          index: qIndex,
          text: question.text,
          imageUrl: question.imageUrl,
          answerOptions: question.answerOptions.map((answerOption, aIndex) => ({
            id: answerOption.id,
            questionId: answerOption.questionId,
            index: aIndex,
            text: answerOption.text,
            isCorrect: answerOption.isCorrect
          }))
        }))
      };
      await createTest(testData);
      setSeverity("success");
      setMessage("Тест успешно создан!");
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Title */}
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Название
                <Box>{titleLength}/{TITLE_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("title")}
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > TITLE_MAX_LENGTH) {
                    target.value = target.value.slice(0, TITLE_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setTitleLength(e.target.value.length);
                  setFormDirty(true);
                }}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание
                <Box>{descriptionLength}/{DESCRIPTION_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!errors.description}
                helperText={errors.description?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > DESCRIPTION_MAX_LENGTH) {
                    target.value = target.value.slice(0, DESCRIPTION_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setDescriptionLength(e.target.value.length);
                  setFormDirty(true);
                }}
              />
            </FormControl>
          </PageCard>

          {/* Draggable grid for questions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography color='text.secondary'>Вопросы {Object.keys(questions).length}/50</Typography>
            <DraggableGrid
              questions={questions}
              activeQuestion={activeQuestion}
              setActiveQuestion={setActiveQuestion}
              handleDragEnd={handleDragEnd}
              addQuestion={addQuestion}
              removeQuestion={removeQuestion}
            />
          </Box>

          {/* Question text and answer options */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                value={questions[activeQuestion].text}
                onChange={(e) => {
                  updateQuestion(activeQuestion, e.target.value);
                  setFormDirty(true);
                }}
                placeholder="Текст вопроса"
              />
              <RadioGroup
                sx={{ display: 'flex', gap: 2 }}
                value={questions[activeQuestion].answerOptions.findIndex(opt => opt.isCorrect)}
                onChange={(e) => {
                  setCorrectAnswer(activeQuestion, parseInt(e.target.value));
                  setFormDirty(true);
                }}
              >
                {questions[activeQuestion].answerOptions.map((option, aIndex) => (
                  <Box key={aIndex} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      value={option.text}
                      onChange={(e) => {
                        updateAnswerOption(activeQuestion, aIndex, e.target.value);
                        setFormDirty(true);
                      }}
                      placeholder={`Вариант ответа ${aIndex + 1}`}
                    />
                    <Box>
                      <FormControlLabel
                        sx={{ margin: 0 }}
                        value={aIndex}
                        control={<Radio />}
                        label="Правильный"
                      />
                    </Box>
                    <IconButton
                      onClick={() => removeAnswerOption(activeQuestion, aIndex)}
                      disabled={questions[activeQuestion].answerOptions.length < 3}
                    >
                      <ClearRoundedIcon />
                    </IconButton>
                  </Box>
                ))}
              </RadioGroup>
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  addAnswerOption(activeQuestion);
                  setFormDirty(true);
                }}
                disabled={questions[activeQuestion].answerOptions.length >= 4}
                sx={{ display: questions[activeQuestion].answerOptions.length >= 4 ? 'none' : 'inline-flex' }}
              >
                Добавить вариант ответа
              </Button>
            </FormControl>
            <Button
              type="submit"
              sx={{ alignSelf: 'center', width: '10rem' }}
              variant={loading ? "outlined" : "contained"}
              disabled={loading}
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </PageCard>
        </Box>
      </ContentContainer>
      <Footer />
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page >
  );
}