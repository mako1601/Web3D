import * as React from 'react';
import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio, Backdrop, CircularProgress, Typography, Select, MenuItem, Checkbox, Collapse, Tooltip, Dialog, DialogTitle, DialogActions, SelectChangeEvent } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import DraggableGrid from '@components/DraggableGrid';
import StyledIconButton from '@components/StyledIconButton';
import ContentContainer from '@components/ContentContainer';
import { questionTypes, TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, QuestionMap, QuestionValidationErrors, QuestionForCreate } from '@mytypes/testTypes';
import { SnackbarContext } from '@context/SnackbarContext';
import { Article } from '@mytypes/articleTypes';

interface TestFormProps {
  mode: 'create' | 'edit';
  title: string;
  description: string;
  questions: QuestionMap;
  activeQuestionId: string;
  formErrors: {
    title: string;
    description: string;
  };
  questionErrors: Record<string, QuestionValidationErrors>;
  loading: boolean;
  isGridVisible: boolean;
  localImages: React.MutableRefObject<Map<string, File>>;
  handleTitleChange: (value: string) => void;
  handleDescriptionChange: (value: string) => void;
  setActiveQuestionId: (id: string) => void;
  addQuestion: () => void;
  updateQuestion: (id: string, updates: Partial<{
    type?: number;
    text?: string;
    imageUrl?: string;
    task?: Partial<{
      options?: string[];
      answer?: boolean[] | [string, string][] | string;
    }>;
  }>) => void;
  removeQuestion: (id: string) => void;
  reorderQuestionsOnDrag: (result: any) => void;
  addAnswerOption: (questionId: string) => void;
  updateAnswerOption: (questionId: string, index: number, value: string, pairIndex?: 0 | 1) => void;
  removeAnswerOption: (questionId: string, index: number) => void;
  handleQuestionChange: (id: string, updates: Partial<QuestionForCreate>) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsGridVisible: (visible: boolean) => void;
  validateQuestion: (question: QuestionForCreate) => QuestionValidationErrors;
  setQuestionErrors: (
    updater: (
      prev: Record<string, QuestionValidationErrors>
    ) => {
      [key: string]: QuestionValidationErrors;
    }
  ) => void;
  shouldValidate: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
  articles: Article[] | null;
  relatedArticleId: number | null;
  setRelatedArticleId: (id: number | null) => void;
}

export default function TestForm({
  mode,
  title,
  description,
  questions,
  activeQuestionId,
  formErrors,
  questionErrors,
  loading,
  isGridVisible,
  localImages,
  handleTitleChange,
  handleDescriptionChange,
  setActiveQuestionId,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestionsOnDrag,
  addAnswerOption,
  updateAnswerOption,
  removeAnswerOption,
  handleQuestionChange,
  setIsDirty,
  setIsGridVisible,
  validateQuestion,
  setQuestionErrors,
  shouldValidate,
  onSubmit,
  onDelete,
  articles,
  relatedArticleId,
  setRelatedArticleId
}: TestFormProps) {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleDialogClickOpen = () => { setOpenDialog(true); };
  const handleDialogClose = () => { setOpenDialog(false); };

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    const value = event.target.value;
    setRelatedArticleId(value === "" ? null : Number(value));
  };

  return (
    <Page>
      {mode === 'edit' && (
        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Вы действительно хотите удалить тест?</DialogTitle>
          <DialogActions>
            <Button onClick={() => { handleDialogClose(); onDelete?.(); }}>Да</Button>
            <Button autoFocus onClick={handleDialogClose}>Нет</Button>
          </DialogActions>
        </Dialog>
      )}

      <Header />
      <ContentContainer gap="1rem">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Title and Description Card */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display="flex" gap={2} sx={{ width: '100%' }}>
              <FormControl sx={{ flex: 2 }}>
                <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  Название теста
                  <Box>{title.length}/{TITLE_MAX_LENGTH}</Box>
                </FormLabel>
                <TextField
                  value={title}
                  fullWidth
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > TITLE_MAX_LENGTH) {
                      target.value = target.value.slice(0, TITLE_MAX_LENGTH);
                    }
                  }}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, }}>
                  <Typography sx={{ margin: '0 0 7px 0' }} color='textSecondary'>
                    Выберите учебный материал
                  </Typography>
                  <Tooltip
                    title="Выберите учебный материал, связанный с тестом, чтобы студенты могли изучить его перед тестированием"
                    placement="top"
                  >
                    <Box sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </Box>
                <Select
                  value={relatedArticleId && articles?.some(a => a.id === relatedArticleId) ? relatedArticleId : ""}
                  onChange={handleChange}
                  displayEmpty
                  disabled={!articles || articles.length === 0}
                  renderValue={(selected) => {
                    if (!selected || !articles?.some(a => a.id === selected)) {
                      return <Typography color="textSecondary">Не выбрано</Typography>;
                    }
                    return articles.find(a => a.id === selected)?.title || selected;
                  }}
                >
                  <MenuItem value="">
                    <em>Не выбрано</em>
                  </MenuItem>
                  {articles?.map(article => (
                    <MenuItem key={article.id} value={article.id}>
                      {article.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание теста
                <Box>{description.length}/{DESCRIPTION_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                value={description}
                fullWidth
                error={!!formErrors.description}
                helperText={formErrors.description}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > DESCRIPTION_MAX_LENGTH) {
                    target.value = target.value.slice(0, DESCRIPTION_MAX_LENGTH);
                  }
                }}
                onChange={(e) => handleDescriptionChange(e.target.value)}
              />
            </FormControl>
          </PageCard>

          {/* Questions Grid */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography color="text.secondary">Задания {Object.keys(questions).length}/50</Typography>
              <StyledIconButton title={isGridVisible ? "Скрыть" : "Показать"} onClick={() => setIsGridVisible(!isGridVisible)}>
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
                  activeQuestionId={activeQuestionId}
                  setActiveQuestionId={setActiveQuestionId}
                  handleDragEnd={reorderQuestionsOnDrag}
                  addQuestion={addQuestion}
                  removeQuestion={removeQuestion}
                />
              </Box>
            </Collapse>
          </Box>

          {/* Question Editor Card */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Question Type Selector */}
            <FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FormLabel>Тип задания</FormLabel>
                <Tooltip
                  title={
                    <div>
                      <li><strong>Один правильный ответ:</strong> вопрос с вариантами ответов, один из которых является правильным</li>
                      <li><strong>Несколько правильных ответов:</strong> вопрос с вариантами ответов, несколько из которых являются правильными</li>
                      <li><strong>Соответствие:</strong> задание, в котором требуется установить правильное соответствие между элементами двух столбцов</li>
                      <li><strong>Заполнение пропущенного термина:</strong> утверждение с пропущенным термином, которое необходимо заполнить</li>
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
                  value={questions[activeQuestionId].type}
                  onChange={(e) => {
                    updateQuestion(activeQuestionId, { type: Number(e.target.value) });
                    setIsDirty(true);
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
              {/* Image Upload */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {!questions[activeQuestionId].imageUrl ? (
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
                            updateQuestion(activeQuestionId, { imageUrl: localUrl });
                            setIsDirty(true);
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
                      src={questions[activeQuestionId].imageUrl}
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
                        const imgUrl = questions[activeQuestionId].imageUrl;
                        if (imgUrl) {
                          localImages.current.delete(imgUrl);
                          URL.revokeObjectURL(imgUrl);
                        }
                        updateQuestion(activeQuestionId, { imageUrl: undefined });
                        setIsDirty(true);
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

              {/* Question Text */}
              {questions[activeQuestionId].type !== 2 && (
                <TextField
                  fullWidth
                  value={questions[activeQuestionId].text ?? ""}
                  onChange={(e) => handleQuestionChange(activeQuestionId, { text: e.target.value })}
                  placeholder={questions[activeQuestionId].type !== 3 ? "Текст вопроса" : "Текст с пропуском"}
                  error={!!questionErrors[activeQuestionId]?.text}
                  helperText={questionErrors[activeQuestionId]?.text}
                />
              )}

              {/* Answer Options - Single Choice */}
              {questions[activeQuestionId].type === 0 && (
                <RadioGroup
                  sx={{ display: 'flex', gap: 2 }}
                  value={(questions[activeQuestionId].task.answer as boolean[])
                    .findIndex(ans => ans === true)
                    .toString()}
                  onChange={(e) => {
                    const answerIndex = parseInt(e.target.value);
                    updateQuestion(activeQuestionId, {
                      task: {
                        answer: (questions[activeQuestionId].task.answer as boolean[])
                          .map((_, idx) => idx === answerIndex)
                      }
                    });
                    setIsDirty(true);
                  }}
                >
                  {questions[activeQuestionId].task.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value);
                          setIsDirty(true);

                          if (shouldValidate) {
                            const updatedQuestion = { ...questions[activeQuestionId] };
                            if (updatedQuestion.type === 0) {
                              updatedQuestion.task.options[index] = e.target.value;
                            }
                            const errors = validateQuestion(updatedQuestion);
                            setQuestionErrors(prev => ({
                              ...prev,
                              [activeQuestionId]: {
                                ...prev[activeQuestionId],
                                options: errors.options
                              }
                            }));
                          }
                        }}
                        placeholder={`Вариант ответа ${index + 1}`}
                        error={!!questionErrors[activeQuestionId]?.options?.[index]}
                        helperText={questionErrors[activeQuestionId]?.options?.[index]}
                      />
                      <Box>
                        <FormControlLabel
                          value={index}
                          control={<Radio />}
                          label="Правильный"
                        />
                      </Box>
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
              )}

              {/* Answer Options - Multiple Choice */}
              {questions[activeQuestionId].type === 1 && (
                <>
                  {questions[activeQuestionId].task.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value);
                          setIsDirty(true);

                          if (shouldValidate) {
                            const updatedQuestion = { ...questions[activeQuestionId] };
                            if (updatedQuestion.type === 1) {
                              updatedQuestion.task.options[index] = e.target.value;
                            }
                            const errors = validateQuestion(updatedQuestion);
                            setQuestionErrors(prev => ({
                              ...prev,
                              [activeQuestionId]: {
                                ...prev[activeQuestionId],
                                options: errors.options
                              }
                            }));
                          }
                        }}
                        placeholder={`Вариант ответа ${index + 1}`}
                        error={!!questionErrors[activeQuestionId]?.options?.[index]}
                        helperText={questionErrors[activeQuestionId]?.options?.[index]}
                      />
                      <FormControlLabel
                        sx={{ alignSelf: 'start', p: '1px 0px 1px 2px' }}
                        control={<Checkbox
                          checked={questions[activeQuestionId].task.answer[index] as boolean}
                          onChange={(e) => {
                            const updatedAnswers = [...(questions[activeQuestionId].task.answer as boolean[])];
                            const trueCount = updatedAnswers.filter(val => val === true).length;

                            if (e.target.checked) {
                              if (trueCount < updatedAnswers.length) {
                                updatedAnswers[index] = true;
                              }
                            } else {
                              if (trueCount > 1) {
                                updatedAnswers[index] = false;
                              }
                            }

                            updateQuestion(activeQuestionId, { task: { answer: updatedAnswers } });
                            setIsDirty(true);
                          }}
                        />}
                        label="Правильный"
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Answer Options - Matching */}
              {questions[activeQuestionId].type === 2 && (
                <>
                  {questions[activeQuestionId].task.answer.map((text, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={text[0]}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value, 0);
                          setIsDirty(true);

                          if (shouldValidate) {
                            const updatedQuestion = { ...questions[activeQuestionId] };
                            if (updatedQuestion.type === 2) {
                              updatedQuestion.task.answer[index][0] = e.target.value;
                            }
                            const errors = validateQuestion(updatedQuestion);
                            setQuestionErrors(prev => ({
                              ...prev,
                              [activeQuestionId]: {
                                ...prev[activeQuestionId],
                                answerPairs: errors.answerPairs
                              }
                            }));
                          }
                        }}
                        placeholder={`Термин ${index + 1}`}
                        error={!!questionErrors[activeQuestionId]?.answerPairs?.[index]?.[0]}
                        helperText={questionErrors[activeQuestionId]?.answerPairs?.[index]?.[0]}
                      />
                      <TextField
                        fullWidth
                        value={text[1]}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value, 1);
                          setIsDirty(true);

                          if (shouldValidate) {
                            const updatedQuestion = { ...questions[activeQuestionId] };
                            if (updatedQuestion.type === 2) {
                              updatedQuestion.task.answer[index][1] = e.target.value;
                            }
                            const errors = validateQuestion(updatedQuestion);
                            setQuestionErrors(prev => ({
                              ...prev,
                              [activeQuestionId]: {
                                ...prev[activeQuestionId],
                                answerPairs: errors.answerPairs
                              }
                            }));
                          }
                        }}
                        placeholder={`Определение ${index + 1}`}
                        error={!!questionErrors[activeQuestionId]?.answerPairs?.[index]?.[1]}
                        helperText={questionErrors[activeQuestionId]?.answerPairs?.[index]?.[1]}
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Answer Options - Fill in the blank */}
              {questions[activeQuestionId].type === 3 && (
                <TextField
                  fullWidth
                  value={questions[activeQuestionId].task.answer}
                  onChange={(e) => handleQuestionChange(activeQuestionId, { task: { answer: e.target.value } })}
                  placeholder="Пропущенное слово"
                  error={!!questionErrors[activeQuestionId]?.fillInBlankAnswer}
                  helperText={questionErrors[activeQuestionId]?.fillInBlankAnswer}
                />
              )}

              {/* Add Answer Option Button */}
              {(questions[activeQuestionId].type !== 3) && (
                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    addAnswerOption(activeQuestionId);
                    setIsDirty(true);
                  }}
                  sx={{
                    display: questions[activeQuestionId].type === 2
                      ? (questions[activeQuestionId].task.answer.length >= 5 ? 'none' : 'inline-flex')
                      : (questions[activeQuestionId].task.answer.length >= 4 ? 'none' : 'inline-flex')
                  }}
                >
                  {questions[activeQuestionId].type !== 2 ? "Добавить вариант ответа" : "Добавить соответствие"}
                </Button>
              )}
            </FormControl>

            {/* Submit/Delete Buttons */}
            <Box display="flex" flexDirection="column" gap={5}>
              <Button
                onClick={onSubmit}
                sx={{ alignSelf: 'center', width: '10rem' }}
                variant={loading ? "outlined" : "contained"}
                disabled={loading}
              >
                {loading ? "Сохранение…" : "Сохранить"}
              </Button>
              {mode === 'edit' && (
                <Button
                  type="button"
                  sx={{ alignSelf: 'center', width: '10rem' }}
                  variant={loading ? "outlined" : "contained"}
                  disabled={loading}
                  color="error"
                  onClick={handleDialogClickOpen}
                >
                  Удалить
                </Button>
              )}
            </Box>
          </PageCard>
        </Box>
      </ContentContainer>
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
    </Page>
  );
}