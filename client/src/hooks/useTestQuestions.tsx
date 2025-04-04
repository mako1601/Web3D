import * as React from 'react';
import { AnswerOption, Question, QuestionMap, QUESTION_MIN, QUESTION_MAX, ANSWER_OPTION_MIN, ANSWER_OPTION_MAX, TestDto, TestForSchemas } from '@mytypes/testTypes';
import { defaultSingleChoiceQuestion, defaultMultipleChoiceQuestion, defaultMatchingQuestion, defaultFillInTheBlankQuestion } from '@mytypes/testTypes';
import { deleteImage, uploadImage } from '@api/cloudinaryApi';
import usePreventUnload from './usePreventUnload';
import { createTest, updateTest } from '@api/testApi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { testSchema } from '@schemas/testSchemas';
import { extractImageIdFromUrl } from '@utils/extractImageIdFromUrl';

export function useTestQuestions(initialQuestions: QuestionMap = {}) {
  const [questions, setQuestions] = React.useState<QuestionMap>(() =>
    Object.keys(initialQuestions).length > 0 ? initialQuestions : { [crypto.randomUUID()]: defaultSingleChoiceQuestion }
  );
  const [activeQuestion, setActiveQuestion] = React.useState<string>(Object.keys(questions)[0]);
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);
  const [isGridVisible, setIsGridVisible] = React.useState(true);
  const [formDirty, setFormDirty] = React.useState(false);
  usePreventUnload(formDirty);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TestForSchemas>({
    resolver: yupResolver(testSchema)
  });

  const useCreateTest = (setSeverity: any, setMessage: any, setOpen: any, navigate: any) => {
    return async (data: TestForSchemas, localImages: React.MutableRefObject<Map<string, File>>) => {
      try {
        const updatedQuestions = await uploadLocalImages(localImages);
        const testData: TestDto = {
          title: data.title,
          description: data.description,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.testId,
            type: question.type,
            index: qIndex,
            text: question.text,
            imageUrl: question.imageUrl,
            correctAnswer: question.correctAnswer,
            answerOptions: question.answerOptions.map((answerOption, aIndex) => ({
              id: answerOption.id,
              questionId: answerOption.questionId,
              index: aIndex,
              text: answerOption.text,
              isCorrect: answerOption.isCorrect,
              matchingPair: answerOption.matchingPair
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

  const useEditTest = (setSeverity: any, setMessage: any, setOpen: any, navigate: any) => {
    return async (
      id: number,
      data: TestForSchemas,
      localImages: React.MutableRefObject<Map<string, File>>,
      initialImageUrls: React.MutableRefObject<string[]>
    ) => {
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
          title: data.title,
          description: data.description,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.testId,
            type: question.type,
            index: qIndex,
            text: question.text,
            imageUrl: question.imageUrl,
            correctAnswer: question.correctAnswer,
            answerOptions: question.answerOptions.map((answerOption, aIndex) => ({
              id: answerOption.id,
              questionId: answerOption.questionId,
              index: aIndex,
              text: answerOption.text,
              isCorrect: answerOption.isCorrect,
              matchingPair: answerOption.matchingPair
            }))
          }))
        };
        await updateTest(id, testData);
        setSeverity("success");
        setMessage("Тест успешно обновлён!");
        navigate("/");
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

  const addQuestion = () => {
    if (Object.keys(questions).length < QUESTION_MAX) {
      const newKey = crypto.randomUUID();
      setQuestions(prev => ({ ...prev, [newKey]: defaultSingleChoiceQuestion }));
      setActiveQuestion(newKey);
    }
  };

  const updateQuestion = <K extends keyof Question>(key: string, field: K, value: Question[K]) => {
    setQuestions((prev) => {
      if (field === "type") {
        let resetQuestion;
        switch (value) {
          case 0:
            resetQuestion = { ...defaultSingleChoiceQuestion, id: prev[key].id, testId: prev[key].testId, [field]: value };
            break;
          case 1:
            resetQuestion = { ...defaultMultipleChoiceQuestion, id: prev[key].id, testId: prev[key].testId, [field]: value };
            break;
          case 2:
            resetQuestion = { ...defaultMatchingQuestion, id: prev[key].id, testId: prev[key].testId, [field]: value };
            break;
          case 3:
            resetQuestion = { ...defaultFillInTheBlankQuestion, id: prev[key].id, testId: prev[key].testId, [field]: value };
            break;
          default:
            resetQuestion = { ...defaultSingleChoiceQuestion, id: prev[key].id, testId: prev[key].testId, [field]: value };
        }
        return { ...prev, [key]: resetQuestion };
      }
      return { ...prev, [key]: { ...prev[key], [field]: value } };
    });
  };

  const removeQuestion = (key: string) => {
    if (Object.keys(questions).length > QUESTION_MIN) {
      setQuestions(prev => {
        const { [key]: removed, ...rest } = prev;
        setActiveQuestion(Object.keys(rest)[0]);
        return rest;
      });
    }
  };

  const addAnswerOption = (key: string) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question && question.answerOptions.length < ANSWER_OPTION_MAX) {
        if (question.type === 2) {
          const newOptions = [...question.answerOptions, { id: 0, questionId: question.id, index: question.answerOptions.length, text: "", isCorrect: false, matchingPair: "" }];
          return { ...prev, [key]: { ...question, answerOptions: newOptions } };
        } else {
          const newOptions = [...question.answerOptions, { id: 0, questionId: question.id, index: question.answerOptions.length, text: "", isCorrect: false }];
          return { ...prev, [key]: { ...question, answerOptions: newOptions } };
        }
      }
      return prev;
    });
  };

  const updateAnswerOption = <K extends keyof AnswerOption>(key: string, index: number, field: K, value: AnswerOption[K]) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question) {
        const newOptions = question.answerOptions.map((opt, i) => i === index ? { ...opt, [field]: value } : opt);
        return { ...prev, [key]: { ...question, answerOptions: newOptions } };
      }
      return prev;
    });
  };

  const setCorrectAnswer = (key: string, index: number) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question) {
        const newOptions = question.answerOptions.map((opt, i) => ({
          ...opt,
          isCorrect: question.type === 0 ? i === index : i === index ? !opt.isCorrect : opt.isCorrect
        }));
        return { ...prev, [key]: { ...question, answerOptions: newOptions } };
      }
      return prev;
    });
  };

  const removeAnswerOption = (key: string, index: number) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question && question.answerOptions.length > ANSWER_OPTION_MIN) {
        const newOptions = question.answerOptions.filter((_, i) => i !== index);
        if (question.answerOptions[index].isCorrect) {
          newOptions[0] = { ...newOptions[0], isCorrect: true };
        }
        return { ...prev, [key]: { ...question, answerOptions: newOptions } };
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
    setActiveQuestion(active.id);
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
    questions,
    setQuestions,
    activeQuestion,
    setActiveQuestion,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    setCorrectAnswer,
    removeAnswerOption,
    setFormDirty,
    uploadLocalImages,
    useCreateTest,
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
  };
}