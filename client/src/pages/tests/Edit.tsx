import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio, CircularProgress, Typography, Backdrop, Checkbox, Select, MenuItem, Collapse, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import DraggableGrid from '@components/DraggableGrid';
import StyledIconButton from '@components/StyledIconButton';
import ContentContainer from '@components/ContentContainer';
import { getTestById } from '@api/testApi';
import { useAuth } from '@context/AuthContext';
import { PageProps } from '@mytypes/commonTypes';
import { DESCRIPTION_MAX_LENGTH, questionTypes, Test, TestForSchemas, TITLE_MAX_LENGTH } from '@mytypes/testTypes';
import { useTestQuestions } from "@hooks/useTestQuestions";

// TODO: add question validation
export default function EditTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = ReactDOM.useNavigate();
  const { id } = ReactDOM.useParams();
  const testId = Number(id);
  const { user, loading: userLoading } = useAuth();
  const [test, setTest] = React.useState<Test | null>(null);
  const [loading, setLoading] = React.useState(false);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());

  const {
    questions,
    activeQuestion,
    setActiveQuestion,
    addQuestion,
    setQuestions,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    setCorrectAnswer,
    removeAnswerOption,
    setFormDirty,
    useEditTest,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    isGridVisible,
    setIsGridVisible,
    register,
    handleSubmit,
    errors,
    reset
  } = useTestQuestions();

  React.useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (isNaN(testId)) { navigate("/", { replace: true }); return; }

    const fetchTest = async () => {
      setLoading(true);
      try {
        const data = await getTestById(testId);
        setTest(data);
        if (Number(data.userId) !== Number(user.id)) {
          navigate("/", { replace: true });
          return;
        }
        setTitleLength(data.title.length);
        setDescriptionLength(data.description.length);
        const sortedQuestions = data.questions.sort((a, b) => a.index - b.index);
        const newQuestions = Object.fromEntries(sortedQuestions.map(question => [crypto.randomUUID(), question]));
        setQuestions(newQuestions);
        setActiveQuestion(Object.keys(newQuestions)[0]);
      } catch (error) {
        console.error("Ошибка загрузки теста: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, user, userLoading]);

  React.useEffect(() => {
    if (test) {
      const imageUrls = Object.values(questions)
        .map(question => question.imageUrl)
        .filter((url): url is string => url !== undefined);;
      initialImageUrls.current = imageUrls;
      reset({
        title: test.title,
        description: test.description
      });
      setTitleLength(test.title.length);
      setDescriptionLength(test.description.length);
    }
  }, [test, reset]);

  const editTest = useEditTest(setSeverity, setMessage, setOpen, navigate);

  const onSubmit = async (data: TestForSchemas) => {
    setLoading(true);
    await editTest(test!.id, data, localImages, initialImageUrls);
    setLoading(false);
  }

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Title */}
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Название теста
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
                Описание теста
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
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography color='text.secondary'>Вопросы {Object.keys(questions).length}/50</Typography>
              <StyledIconButton onClick={() => setIsGridVisible(!isGridVisible)}>
                {isGridVisible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </StyledIconButton>
            </Box>
            <Collapse in={isGridVisible} timeout="auto">
              <Box sx={{
                position: 'relative',
                overflow: 'visible',
                p: '2px',
                '& > *': {
                  overflow: 'visible'
                }
              }}>
                <DraggableGrid
                  questions={questions}
                  activeQuestion={activeQuestion}
                  setActiveQuestion={setActiveQuestion}
                  handleDragEnd={reorderQuestionsOnDrag}
                  addQuestion={addQuestion}
                  removeQuestion={removeQuestion}
                />
              </Box>
            </Collapse>
          </Box>

          {/* Question text and answer options */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Question type selector */}
            <FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FormLabel>Тип вопроса</FormLabel>
                <Tooltip
                  title={
                    <div>
                      <li><strong>Один правильный ответ:</strong> вопрос с несколькими вариантами ответов, из которых только один является правильным</li>
                      <li><strong>Несколько правильных ответов:</strong> вопрос с несколькими вариантами ответа, и несколько из них могут быть правильными</li>
                      <li><strong>Соответствие:</strong> вопрос, в котором требуется установить связь между двумя наборами элементов</li>
                      <li><strong>Заполнение пропущенного слова:</strong> вопрос, в котором необходимо заполнить пропущенное слово в предложении</li>
                    </div>
                  }
                  placement="right"
                >
                  <Box sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                    <InfoOutlinedIcon fontSize='small' />
                  </Box>
                </Tooltip>
              </Box>
              <Box>
                <Select
                  value={questions[activeQuestion].type}
                  onChange={(e) => {
                    updateQuestion(activeQuestion, "type", Number(e.target.value));
                    setFormDirty(true);
                  }}
                  sx={{
                    '& > div': {
                      padding: '0.5rem 1rem',
                      cursor: 'pointer'
                    },
                    p: 0,
                    cursor: 'pointer'
                  }}
                >
                  {questionTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </Box>
            </FormControl>

            <FormControl sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Question text */}
              <TextField
                fullWidth
                value={questions[activeQuestion].text}
                onChange={(e) => {
                  updateQuestion(activeQuestion, "text", e.target.value);
                  setFormDirty(true);
                }}
                placeholder="Текст вопроса"
              />

              {/* Upload image button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {!questions[activeQuestion].imageUrl ? (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{
                      color: 'text.secondary',
                      width: '600px',
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: 'gray',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">Загрузить изображение</Typography>
                    <Typography variant="body2" color="text.secondary">Рекомендуемое разрешение 600x300</Typography>
                    <Typography variant="body2" color="text.secondary">Максимальный размер 5МБ</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const fileInput = e.target;
                        if (fileInput && fileInput.files) {
                          const file = fileInput.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setOpen(true);
                              setSeverity("warning");
                              setMessage("Размер файла превышает 5 МБ. Пожалуйста, выберите файл меньшего размера");
                              return;
                            }
                            const localUrl = URL.createObjectURL(file);
                            localImages.current.set(localUrl, file);
                            updateQuestion(activeQuestion, "imageUrl", localUrl);
                            setFormDirty(true);
                          }
                        }
                      }}
                    />
                  </Button>
                ) : (
                  <Box
                    sx={{
                      width: '600px',
                      height: '300px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      background: 'rgba(107, 107, 107, 0.25)',
                    }}
                  >
                    <img
                      src={questions[activeQuestion].imageUrl}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <IconButton
                      size="small"
                      title="Удалить изображение"
                      onClick={() => {
                        localImages.current.delete(questions[activeQuestion].imageUrl!);
                        updateQuestion(activeQuestion, "imageUrl", undefined);
                        setFormDirty(true);
                      }}
                      sx={{
                        position: 'absolute',
                        width: '1.5rem',
                        height: '1.5rem',
                        top: 8,
                        right: 8,
                        borderRadius: '20px',
                        backgroundColor: 'rgba(177, 177, 177, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgb(158, 158, 158)',
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Question types */}
              {/* Single Choice */}
              {questions[activeQuestion].type === 0 && (
                <RadioGroup
                  sx={{ display: 'flex', gap: 2 }}
                  value={questions[activeQuestion].answerOptions.findIndex(opt => opt.isCorrect)}
                  onChange={(e) => {
                    setCorrectAnswer(activeQuestion, parseInt(e.target.value));
                    setFormDirty(true);
                  }}
                >
                  {questions[activeQuestion].answerOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option.text}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestion, index, "text", e.target.value);
                          setFormDirty(true);
                        }}
                        placeholder={`Вариант ответа ${index + 1}`}
                      />
                      <Box>
                        <FormControlLabel
                          sx={{ margin: 0 }}
                          value={index}
                          control={<Radio />}
                          label="Правильный"
                        />
                      </Box>
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestion, index)}
                        disabled={questions[activeQuestion].answerOptions.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
              )}

              {/* Multiple Choice */}
              {questions[activeQuestion].type === 1 && (
                <>
                  {questions[activeQuestion].answerOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option.text}
                        onChange={(e) => updateAnswerOption(activeQuestion, index, "text", e.target.value)}
                        placeholder={`Вариант ответа ${index + 1}`}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={option.isCorrect} onChange={() => setCorrectAnswer(activeQuestion, index)} />}
                        label="Правильный"
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestion, index)}
                        disabled={questions[activeQuestion].answerOptions.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Matching */}
              {questions[activeQuestion].type === 2 && (
                <>
                  {questions[activeQuestion].answerOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option.text}
                        onChange={(e) => updateAnswerOption(activeQuestion, index, "text", e.target.value)}
                        placeholder={`Элемент ${index + 1}`}
                      />
                      <TextField
                        fullWidth
                        value={option.matchingPair}
                        onChange={(e) => updateAnswerOption(activeQuestion, index, "matchingPair", e.target.value)}
                        placeholder="Соответствие"
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestion, index)}
                        disabled={questions[activeQuestion].answerOptions.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Fill in the blank */}
              {questions[activeQuestion].type === 3 && (
                <TextField
                  fullWidth
                  value={questions[activeQuestion].correctAnswer}
                  onChange={(e) => updateQuestion(activeQuestion, "correctAnswer", e.target.value)}
                  placeholder="Правильный ответ"
                />
              )}

              {(questions[activeQuestion].type === 0 || questions[activeQuestion].type === 1) && (
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
              )}
              {questions[activeQuestion].type === 2 && (
                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    addAnswerOption(activeQuestion);
                    setFormDirty(true);
                  }}
                  disabled={questions[activeQuestion].answerOptions.length >= 5}
                  sx={{ display: questions[activeQuestion].answerOptions.length >= 5 ? 'none' : 'inline-flex' }}
                >
                  Добавить вариант ответа
                </Button>
              )}
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
        open={loading || userLoading || !test}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page >
  );
}