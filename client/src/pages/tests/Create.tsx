import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import uuid from 'react-native-uuid';
import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

import Page from '../../components/Page';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageCard from '../../components/PageCard';
import DraggableGrid from '../../components/DraggableGrid';
import ContentContainer from '../../components/ContentContainer';
import { createTest, AnswerOptionDto, QuestionForCreate, TestForCreate, TestDto } from '../../api/testApi';
import { PageProps } from '../../App';

const testSchema = yup.object().shape({
  title: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(60, "Название не может превышать 60 символов"),
  description: yup.string()
    .trim()
    .optional()
    .max(250, "Описание не может превышать 250 символов")
    .default(""),
  questions: yup.array().of(
    yup.object().shape({
      id: yup.string().default(uuid.v4()),
      index: yup.number().default(1),
      text: yup.string()
        .trim()
        .required("Обязательное поле")
        .max(128, "Максимум 128 символов"),
      answerOptions: yup.array().of(
        yup.object().shape({
          index: yup.number().default(1),
          text: yup.string()
            .trim()
            .required("Обязательное поле")
            .max(30, "Максимум 30 символов"),
          isCorrect: yup.boolean().default(true)
        })
      ).max(4, "Максимум 4 варианта ответа").required()
    })
  ).max(50, "Максимум 50 вопросов").required()
});

export default function CreateTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuestionForCreate[]>([{
    id: uuid.v4(),
    index: 0,
    text: "",
    answerOptions: [
      { index: 0, text: "", isCorrect: true },
      { index: 1, text: "", isCorrect: false }
    ]
  }]);
  const [activeQuestion, setActiveQuestion] = React.useState<string>(questions[0].id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<TestForCreate>({
    resolver: yupResolver(testSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: []
    }
  });

  // React.useEffect(() => {
  //   console.log(errors);
  //   console.log(questions);
  //   // if (Object.keys(errors).length > 0) {
  //   //   setSeverity("error");
  //   //   setMessage("Заполнены не все обязательные поля");
  //   //   setOpen(true);
  //   // }
  // }, [errors]);

  const updateQuestion = (id: string, field: keyof QuestionForCreate, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const addAnswerOption = (questionId: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId && q.answerOptions.length < 4
          ? {
            ...q,
            answerOptions: [
              ...q.answerOptions,
              {
                index: q.answerOptions.length,
                text: "",
                isCorrect: false
              },
            ].map((opt, idx) => ({
              ...opt,
              index: idx,
            })),
          }
          : q
      )
    );
  };

  const updateAnswerOption = (
    questionId: string,
    optionIndex: number,
    field: keyof AnswerOptionDto,
    value: string
  ) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            answerOptions: q.answerOptions.map((opt, i) =>
              i === optionIndex ? { ...opt, [field]: value } : opt
            ),
          }
          : q
      )
    );
  };

  const setCorrectAnswer = (questionId: string, correctIndex: number) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            answerOptions: q.answerOptions.map((opt, idx) => ({
              ...opt,
              isCorrect: idx === correctIndex,
            })),
          }
          : q
      )
    );
  };

  const removeAnswerOption = (questionId: string, optionIndex: number) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q) => {
        if (q.id === questionId) {
          if (q.answerOptions.length > 2) {
            return {
              ...q,
              answerOptions: q.answerOptions
                .filter((_, i) => i !== optionIndex)
                .map((opt, idx) => ({
                  ...opt,
                  index: idx,
                })),
            };
          } else {
            setSeverity("error");
            setMessage("Минимум 2 варианта ответа");
            setOpen(true);
            return q;
          }
        }
        return q;
      });
    });
  };

  const onSubmit = async (data: TestForCreate) => {
    console.log(data);
    try {
      setLoading(true);
      const testData: TestDto = {
        title: data.title,
        description: data.description,
        questions: questions.map((question) => ({
          index: question.index,
          text: question.text,
          imageUrl: question.imageUrl,
          answerOptions: question.answerOptions.map((answerOption) => ({
            index: answerOption.index,
            text: answerOption.text,
            isCorrect: answerOption.isCorrect,
          })),
        })),
      };
      await createTest(testData);
      setSeverity("success");
      setMessage("Тест успешно создан!");
      reset();
      setQuestions([
        {
          id: uuid.v4(),
          index: 0,
          text: "",
          answerOptions: [
            { index: 0, text: "", isCorrect: true },
            { index: 1, text: "", isCorrect: false }
          ]
        }
      ]);
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      setMessage(e.response?.data || "Произошла ошибка");
    } finally {
      setOpen(true);
      setLoading(false);
    }
  };

  const activeQuestionIndex = questions.findIndex((q) => q.id === activeQuestion);
  const activeQuestionObj = questions[activeQuestionIndex] ?? null;

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <DraggableGrid
          questions={questions}
          setQuestions={setQuestions}
          activeQuestion={activeQuestion}
          setActiveQuestion={setActiveQuestion}
        />
        <PageCard>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel>Название</FormLabel>
              <TextField
                {...register("title")}
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Описание</FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Вопрос</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name={`questions.${activeQuestionIndex}.text`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        value={activeQuestionObj ? activeQuestionObj.text : ""}
                        onChange={(e) => {
                          field.onChange(e);
                          updateQuestion(activeQuestion, "text", e.target.value);
                        }}
                        placeholder="Вопрос"
                        error={!!errors.questions?.[activeQuestionIndex]?.text}
                        helperText={errors.questions?.[activeQuestionIndex]?.text?.message}
                      />
                    )}
                  />
                  <RadioGroup
                    sx={{ display: 'flex', gap: 2 }}
                    value={activeQuestionObj ? activeQuestionObj.answerOptions.findIndex((opt) => opt.isCorrect) : -1}
                    onChange={(e) => setCorrectAnswer(activeQuestion, parseInt(e.target.value))}
                  >
                    {activeQuestionObj?.answerOptions.map((option, aIndex) => (
                      <Box key={aIndex} sx={{ display: 'flex', gap: 2 }}>
                        <Controller
                          name={`questions.${activeQuestionIndex}.answerOptions.${aIndex}.text`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              value={option.text}
                              onChange={(e) => {
                                field.onChange(e);
                                updateAnswerOption(activeQuestion, aIndex, "text", e.target.value);
                              }}
                              placeholder={`Ответ ${aIndex + 1}`}
                              error={!!errors.questions?.[activeQuestionIndex]?.answerOptions?.[aIndex]?.text}
                              helperText={errors.questions?.[activeQuestionIndex]?.answerOptions?.[aIndex]?.text?.message}
                            />
                          )}
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
                    onClick={() => addAnswerOption(activeQuestion)}
                    disabled={activeQuestionObj === null || activeQuestionObj.answerOptions.length >= 4}
                    sx={{ display: activeQuestionObj?.answerOptions?.length >= 4 ? 'none' : 'inline-flex' }}
                  >
                    Добавить вариант ответа
                  </Button>
                </Box>
              </Box>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant={loading ? "outlined" : "contained"}
              disabled={loading}
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </Box>
        </PageCard>
      </ContentContainer>
      <Footer />
    </Page>
  );
}