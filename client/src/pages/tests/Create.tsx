import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import uuid from 'react-native-uuid';
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
import { AnswerOptionDto, QuestionForCreate, TestDto, TestForCreate } from '@mytypes/testTypes';
import { testSchema } from '@schemas/testSchemas';

// TODO: add question validation
export default function CreateTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const createDefaultQuestion = () => ({
    id: uuid.v4(),
    index: 0,
    text: "",
    answerOptions: [
      { index: 0, text: "", isCorrect: true },
      { index: 1, text: "", isCorrect: false }
    ]
  });

  const navigate = ReactDOM.useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [formDirty, setFormDirty] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuestionForCreate[]>([createDefaultQuestion()]);
  const [activeQuestion, setActiveQuestion] = React.useState<string>(questions[0].id);

  const TITLE_MAX_LENGTH = 60;
  const DESCRIPTION_MAX_LENGTH = 250;
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TestForCreate>({
    resolver: yupResolver(testSchema)
  });

  const updateQuestion = (id: string, field: keyof QuestionForCreate, value: string) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = prevQuestions.map(q => q.id === id ? { ...q, [field]: value } : q);
      return updatedQuestions;
    });
  };

  const addAnswerOption = (questionId: string) => {
    setQuestions(prevQuestions => {
      return prevQuestions.map(q => {
        if (q.id === questionId && q.answerOptions.length < 4) {
          const newAnswerOptions = [...q.answerOptions, { index: q.answerOptions.length, text: "", isCorrect: false }];
          return { ...q, answerOptions: newAnswerOptions.map((opt, idx) => ({ ...opt, index: idx })) };
        }
        return q;
      });
    });
  };

  const updateAnswerOption = (questionId: string, optionIndex: number, field: keyof AnswerOptionDto, value: string) => {
    setQuestions(prevQuestions => {
      return prevQuestions.map(q => {
        if (q.id === questionId) {
          const updatedOptions = q.answerOptions.map((opt, i) => i === optionIndex ? { ...opt, [field]: value } : opt);
          return { ...q, answerOptions: updatedOptions };
        }
        return q;
      });
    });
  };

  const setCorrectAnswer = (questionId: string, correctIndex: number) => {
    setQuestions(prevQuestions => {
      return prevQuestions.map(q => {
        if (q.id === questionId) {
          const updatedOptions = q.answerOptions.map((opt, idx) => ({ ...opt, isCorrect: idx === correctIndex }));
          return { ...q, answerOptions: updatedOptions };
        }
        return q;
      });
    });
  };

  const removeAnswerOption = (questionId: string, optionIndex: number) => {
    setQuestions(prevQuestions => {
      return prevQuestions.map(q => {
        if (q.id === questionId) {
          if (q.answerOptions.length > 2) {
            const newOptions = q.answerOptions.filter((_, i) => i !== optionIndex);
            if (q.answerOptions[optionIndex].isCorrect) {
              newOptions[0] = { ...newOptions[0], isCorrect: true };
            }
            return { ...q, answerOptions: newOptions.map((opt, idx) => ({ ...opt, index: idx })) };
          } else {
            setSeverity("error");
            setMessage("Минимум 2 варианта ответа");
            setOpen(true);
          }
        }
        return q;
      });
    });
  };

  const onSubmit = async (data: TestForCreate) => {
    try {
      setLoading(true);
      const testData: TestDto = {
        title: data.title,
        description: data.description,
        questions: questions.map(question => ({
          index: question.index,
          text: question.text,
          imageUrl: question.imageUrl,
          answerOptions: question.answerOptions.map(answerOption => ({
            index: answerOption.index,
            text: answerOption.text,
            isCorrect: answerOption.isCorrect,
          })),
        })),
      };
      await createTest(testData);
      setSeverity("success");
      setMessage("Тест успешно создан!");
      navigate("/");
    } catch (e: any) {
      setSeverity("error");
      setMessage(e.response?.data || "Произошла ошибка");
    } finally {
      setOpen(true);
      setLoading(false);
    }
  };

  const activeQuestionIndex = questions.findIndex(q => q.id === activeQuestion);
  const activeQuestionObj = questions[activeQuestionIndex] ?? null;

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formDirty) {
        event.preventDefault();
        return "";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formDirty]);

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
            <Typography color='text.secondary'>Вопросы {questions.length}/50</Typography>
            <DraggableGrid
              questions={questions}
              setQuestions={setQuestions}
              activeQuestion={activeQuestion}
              setActiveQuestion={setActiveQuestion}
            />
          </Box>

          {/* Question text and answer options */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                value={activeQuestionObj ? activeQuestionObj.text : ""}
                onChange={(e) => {
                  updateQuestion(activeQuestion, "text", e.target.value);
                  setFormDirty(true);
                }}
                placeholder="Текст вопроса"
              />
              <RadioGroup
                sx={{ display: 'flex', gap: 2 }}
                value={activeQuestionObj ? activeQuestionObj.answerOptions.findIndex(opt => opt.isCorrect) : -1}
                onChange={(e) => {
                  setCorrectAnswer(activeQuestion, parseInt(e.target.value));
                  setFormDirty(true);
                }}
              >
                {activeQuestionObj?.answerOptions.map((option, aIndex) => (
                  <Box key={aIndex} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      value={option.text}
                      onChange={(e) => {
                        updateAnswerOption(activeQuestion, aIndex, "text", e.target.value);
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
                    <IconButton onClick={() => removeAnswerOption(activeQuestion, aIndex)} color="error">
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
                disabled={activeQuestionObj === null || activeQuestionObj.answerOptions.length >= 4}
                sx={{ display: activeQuestionObj?.answerOptions?.length >= 4 ? 'none' : 'inline-flex' }}
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