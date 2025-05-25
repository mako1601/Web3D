import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { QuestionMap, QUESTION_MIN, QUESTION_MAX, ANSWER_OPTION_MIN, ANSWER_OPTION_MAX, QuestionType, QuestionForCreate, TestDto, UserAnswer, AnswerResultDto, QuestionValidationErrors, FILL_IN_THE_BLANK_MAX_LENGTH, ANSWER_OPTION_TEXT_MAX_LENGTH, QUESTION_TEXT_MAX_LENGTH, TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '@mytypes/testTypes';
import { createDefaultSingleChoiceQuestion, createDefaultMultipleChoiceQuestion, createDefaultMatchingQuestion, createDefaultFillInTheBlankQuestion } from '@mytypes/testTypes';
import { deleteImage, uploadImage } from '@api/cloudinaryApi';
import { createTest, deleteTest, finishTest, updateTest } from '@api/testApi';
import { extractImageIdFromUrl } from '@utils/extractImageIdFromUrl';
import { usePreventNavigation } from './usePreventNavigation';
import { SnackbarContext } from '@context/SnackbarContext';

export function useTestQuestions() {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [questions, setQuestions] = React.useState<QuestionMap>({
    [crypto.randomUUID()]: createDefaultSingleChoiceQuestion()
  });
  const [formErrors, setFormErrors] = React.useState({ title: '', description: '' });
  const [shouldValidateForm, setShouldValidateForm] = React.useState(false);
  const [questionErrors, setQuestionErrors] = React.useState<Record<string, QuestionValidationErrors>>({});
  const [shouldValidate, setShouldValidate] = React.useState(false);

  const [activeQuestionId, setActiveQuestionId] = React.useState<string>(Object.keys(questions)[0]);
  const [isGridVisible, setIsGridVisible] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const allowNavigationRef = React.useRef(false);

  const blocker = usePreventNavigation(isDirty, allowNavigationRef);
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmation = window.confirm(
        "Внесенные изменения могут не сохраниться."
      );
      if (!confirmation) {
        blocker.reset();
      } else {
        blocker.proceed();
      }
    }
  }, [blocker.state]);

  const validateTitle = (value: string): string => {
    if (!value.trim()) return 'Обязательное поле';
    if (value.length > TITLE_MAX_LENGTH) return `Название не может превышать ${TITLE_MAX_LENGTH} символов`;
    return '';
  };

  const validateDescription = (value: string): string => {
    if (value.length > DESCRIPTION_MAX_LENGTH) return `Описание не может превышать ${DESCRIPTION_MAX_LENGTH} символов`;
    return '';
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setIsDirty(true);
    if (shouldValidateForm) {
      setFormErrors(prev => ({
        ...prev,
        title: validateTitle(value)
      }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setIsDirty(true);
    if (shouldValidateForm) {
      setFormErrors(prev => ({
        ...prev,
        description: validateDescription(value)
      }));
    }
  };

  const validateForm = (): boolean => {
    const titleError = validateTitle(title);
    const descriptionError = validateDescription(description);

    setFormErrors({
      title: titleError,
      description: descriptionError
    });
    setShouldValidateForm(true);

    const questionsValid = validateAllQuestions();

    return !titleError && !descriptionError && questionsValid;
  };

  const validateAllQuestions = (): boolean => {
    const newErrors: Record<string, QuestionValidationErrors> = {};
    let isValid = true;

    Object.entries(questions).forEach(([id, question]) => {
      const errors = validateQuestion(question);
      if (Object.keys(errors).length > 0) {
        newErrors[id] = errors;
        isValid = false;
      }
    });

    setQuestionErrors(newErrors);
    setShouldValidate(true);
    return isValid;
  };

  const handleQuestionChange = (id: string, updates: Partial<QuestionForCreate>) => {
    updateQuestion(id, updates);
    setIsDirty(true);
    if (shouldValidate) {
      const updatedQuestion = { ...questions[id], ...updates } as QuestionForCreate;
      const errors = validateQuestion(updatedQuestion);
      setQuestionErrors(prev => ({
        ...prev,
        [id]: errors
      }));
    }
  };

  const validateQuestion = (question: QuestionForCreate): QuestionValidationErrors => {
    const errors: QuestionValidationErrors = {};

    if (question.type !== 2) {
      if (!question.text || !question.text.trim()) {
        errors.text = `Обязательное поле`;
      } else if (question.text.length > QUESTION_TEXT_MAX_LENGTH) {
        errors.text = `Текст вопроса не должен превышать ${QUESTION_TEXT_MAX_LENGTH} символов`;
      }
    }

    if (question.type === 0 || question.type === 1) {
      const optionsErrors: string[] = [];
      question.task.options.forEach((option, index) => {
        if (!option.trim()) {
          optionsErrors[index] = 'Обязательное поле';
        } else if (option.length > ANSWER_OPTION_TEXT_MAX_LENGTH) {
          optionsErrors[index] = `Вариант ответа не должен превышать ${ANSWER_OPTION_TEXT_MAX_LENGTH} символов`;
        }
      });

      if (optionsErrors.length > 0) {
        errors.options = optionsErrors;
      }
    }

    if (question.type === 2) {
      const answerPairsErrors: string[][] = [];
      const valueOccurrences = new Map<string, { count: number, indexes: Array<{ pairIndex: number, elementIndex: number }> }>();

      (question.task.answer as [string, string][]).forEach((pair, pairIndex) => {
        [0, 1].forEach(elementIndex => {
          const value = pair[elementIndex].trim();
          if (!value) return;

          const normalizedValue = value.toLowerCase();
          const existing = valueOccurrences.get(normalizedValue) || { count: 0, indexes: [] };

          valueOccurrences.set(normalizedValue, {
            count: existing.count + 1,
            indexes: [...existing.indexes, { pairIndex, elementIndex }]
          });
        });
      });

      (question.task.answer as [string, string][]).forEach((pair, pairIndex) => {
        const pairErrors: string[] = [];

        [0, 1].forEach(elementIndex => {
          const value = pair[elementIndex].trim();

          if (!value) {
            pairErrors[elementIndex] = 'Обязательное поле';
            return;
          }

          if (value.length > 100) {
            pairErrors[elementIndex] = `Максимальная длина ${ANSWER_OPTION_TEXT_MAX_LENGTH} символов`;
            return;
          }

          const normalizedValue = value.toLowerCase();
          const occurrence = valueOccurrences.get(normalizedValue);

          if (occurrence && occurrence.count > 1) {
            pairErrors[elementIndex] = 'Не должно быть дублирующихся строк';
          }
        });

        if (pairErrors.length > 0) {
          answerPairsErrors[pairIndex] = pairErrors;
        }
      });

      if (answerPairsErrors.length > 0) {
        errors.answerPairs = answerPairsErrors;
      }
    }

    if (question.type === 3) {
      if (!question.task.answer.trim()) {
        errors.fillInBlankAnswer = 'Обязательное поле';
      } else if (question.task.answer.length > FILL_IN_THE_BLANK_MAX_LENGTH) {
        errors.fillInBlankAnswer = `Ответ не должен превышать ${FILL_IN_THE_BLANK_MAX_LENGTH} символов`;
      }
    }

    return errors;
  };

  const useCreateTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (localImages: React.MutableRefObject<Map<string, File>>) => {
      if (!validateForm()) {
        setSeverity("error");
        setMessage("Исправьте ошибки в вопросах перед сохранением");
        setOpen(true);
        return;
      }

      try {
        const updatedQuestions = await uploadLocalImages(localImages);
        const testData: TestDto = {
          title: title,
          description: description || undefined,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.id,
            index: qIndex,
            type: question.type,
            text: question.text,
            taskJson: JSON.stringify(question.task),
            imageUrl: question.imageUrl
          }))
        };
        await createTest(testData);
        setSeverity("success");
        setMessage("Тест успешно создан!");
        allowNavigationRef.current = true;
        navigate("/profile/tests");
      } catch (e: any) {
        console.error(e);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      } finally {
        setOpen(true);
      }
    };
  };

  const useEditTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      id: number,
      localImages: React.MutableRefObject<Map<string, File>>,
      initialImageUrls: React.MutableRefObject<string[]>
    ) => {
      if (!validateForm()) {
        setSeverity("error");
        setMessage("Исправьте ошибки в вопросах перед сохранением");
        setOpen(true);
        return;
      }

      try {
        const updatedQuestions = await uploadLocalImages(localImages);
        const questionImageUrls = new Set(Object.values(questions)
          .map(question => question.imageUrl)
          .filter(url => url !== undefined));
        const deletedImages = initialImageUrls.current.filter(url => !questionImageUrls.has(url));
        for (const imageUrl of deletedImages) {
          await deleteImage(extractImageIdFromUrl(imageUrl));
        }
        const testData: TestDto = {
          title: title,
          description: description || undefined,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.testId,
            index: qIndex,
            type: question.type,
            text: question.text,
            taskJson: JSON.stringify(question.task),
            imageUrl: question.imageUrl
          }))
        };
        await updateTest(id, testData);
        setSeverity("success");
        setMessage("Тест успешно обновлён!");
        allowNavigationRef.current = true;
        navigate("/profile/tests");
      } catch (e: any) {
        console.error(e);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      } finally {
        setOpen(true);
      }
    };
  };

  const useDeleteTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      id: number
    ) => {
      try {
        await deleteTest(id);
        setSeverity("success");
        setMessage("Тест успешно удалён!");
        allowNavigationRef.current = true;
        navigate("/profile/tests");
      } catch (e: any) {
        console.error(e);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      } finally {
        setOpen(true);
      }
    };
  };

  const useFinishTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      id: number,
      answers: UserAnswer[],
    ) => {
      try {
        const answerResults: AnswerResultDto[] = answers.map(answer => ({
          questionId: answer.questionId,
          type: answer.type,
          userAnswerJson: JSON.stringify(answer.task)
        }));
        await finishTest(id, answerResults);
        allowNavigationRef.current = true;
        navigate("/profile/results");
      } catch (e: any) {
        console.error(e);
        setOpen(true);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      }
    };
  };

  const addQuestion = () => {
    if (Object.keys(questions).length < QUESTION_MAX) {
      const newKey = crypto.randomUUID();
      setQuestions(prev => ({ ...prev, [newKey]: createDefaultSingleChoiceQuestion() }));
      setActiveQuestionId(newKey);
    }
  };

  const updateQuestion = (
    key: string,
    updates: Partial<{
      type?: QuestionType;
      text?: string;
      imageUrl?: string;
      task?: Partial<{
        options?: string[];
        answer?: boolean[] | [string, string][] | string;
      }>;
    }>
  ) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      let updatedQuestion = { ...question, ...updates, task: { ...question.task, ...(updates.task || {}) } } as QuestionForCreate;

      if (updates.type !== undefined && updates.type === updatedQuestion.type) {
        switch (updates.type) {
          case QuestionType.SingleChoice:
            updatedQuestion = { ...createDefaultSingleChoiceQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.MultipleChoice:
            updatedQuestion = { ...createDefaultMultipleChoiceQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.Matching:
            updatedQuestion = { ...createDefaultMatchingQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.FillInTheBlank:
            updatedQuestion = { ...createDefaultFillInTheBlankQuestion(), id: question.id, testId: question.testId };
            break;
          default:
            updatedQuestion = { ...createDefaultSingleChoiceQuestion(), id: question.id, testId: question.testId };
        }
      }

      return { ...prev, [key]: updatedQuestion };
    });
  };

  const removeQuestion = (key: string) => {
    if (Object.keys(questions).length > QUESTION_MIN) {
      setQuestions(prev => {
        const { [key]: removed, ...rest } = prev;
        setActiveQuestionId(Object.keys(rest)[0]);
        return rest;
      });
    }
  };

  const addAnswerOption = (key: string) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      if (question.type === 0 || question.type === 1) {
        if (question.task.options.length >= ANSWER_OPTION_MAX - 1) {
          return prev;
        } else {
          const newOptions = [...question.task.options, ""];
          const newAnswer = [...question.task.answer, false];
          return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions, answer: newAnswer } } as QuestionForCreate };
        }
      }

      if (question.type === 2) {
        if (question.task.answer.length >= ANSWER_OPTION_MAX) {
          return prev;
        } else {
          const newAnswer = [...question.task.answer, ["", ""]];
          return { ...prev, [key]: { ...question, task: { answer: newAnswer } } as QuestionForCreate };
        }
      }

      return prev;
    });
  };

  const updateAnswerOption = (key: string, index: number, value: string, pairIndex?: 0 | 1) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      if ((question.type === 0 || question.type === 1) && Array.isArray(question.task.options)) {
        const newOptions = [...question.task.options];
        newOptions[index] = value;
        return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions } } };
      }

      if (question.type === 2 && Array.isArray(question.task.answer)) {
        const newAnswer = [...question.task.answer];
        const pair = [...newAnswer[index]] as [string, string];
        if (pairIndex === 0 || pairIndex === 1) {
          pair[pairIndex] = value;
        }
        newAnswer[index] = pair;

        return { ...prev, [key]: { ...question, task: { answer: newAnswer } } };
      }

      if (question.type === 3 && typeof question.task.answer === "string") {
        return { ...prev, [key]: { ...question, task: { answer: value } } };
      }

      return prev;
    });
  };

  const removeAnswerOption = (key: string, index: number) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;
      if ((question.type === 0 || question.type === 1) && question.task.options.length > ANSWER_OPTION_MIN) {
        const newOptions = question.task.options.filter((_, idx) => idx !== index);
        const newAnswer = question.task.answer.filter((_, idx) => idx !== index);

        if (!newAnswer.includes(true)) {
          newAnswer[0] = true;
        }

        return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions, answer: newAnswer } } };
      }

      if (question.type === 2 && question.task.answer.length > 2) {
        const newAnswer = question.task.answer.filter((_, idx) => idx !== index);
        return { ...prev, [key]: { ...question, task: { answer: newAnswer } } };
      }

      return prev;
    });
  };

  const reorderQuestionsOnDrag = (event: any) => {
    const { active, over } = event;
    if (over || active.id !== over.id) {
      setQuestions(prev => {
        const entries = Object.entries(prev);
        const oldIndex = entries.findIndex(([key]) => key === active.id);
        const newIndex = entries.findIndex(([key]) => key === over.id);
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        const newOrder = [...entries];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);
        return Object.fromEntries(newOrder);
      });
    }
    setActiveQuestionId(active.id);
  };

  const uploadLocalImages = async (localImages: React.MutableRefObject<Map<string, File>>) => {
    const updatedQuestions = { ...questions };
    for (const [url, file] of localImages.current.entries()) {
      try {
        const imageUrl = await uploadImage(file);
        const questionId = Object.keys(updatedQuestions).find(id => updatedQuestions[id].imageUrl === url);
        if (questionId) {
          updatedQuestions[questionId].imageUrl = imageUrl;
        }
      } catch (e: any) {
        throw new Error("Файл не найден");
      }
    }
    return updatedQuestions;
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    formErrors,
    handleTitleChange,
    handleDescriptionChange,
    validateForm,
    questions,
    setQuestions,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    removeAnswerOption,
    setIsDirty,
    uploadLocalImages,
    useCreateTest,
    useEditTest,
    useDeleteTest,
    useFinishTest,
    isGridVisible,
    setIsGridVisible,
    questionErrors,
    setQuestionErrors,
    validateQuestion,
    handleQuestionChange,
    validateAllQuestions,
    shouldValidate
  };
}