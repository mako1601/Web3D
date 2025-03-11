import * as React from 'react';
import { AnswerOption, Question, QuestionMap, QUESTION_MIN, QUESTION_MAX, ANSWER_OPTION_MIN, ANSWER_OPTION_MAX } from '@mytypes/testTypes';
import { defaultSingleChoiceQuestion, defaultMultipleChoiceQuestion, defaultMatchingQuestion, defaultFillInTheBlankQuestion } from '@mytypes/testTypes';

export function useTestQuestions(initialQuestions: QuestionMap = {}) {
  const [questions, setQuestions] = React.useState<QuestionMap>(() =>
    Object.keys(initialQuestions).length > 0 ? initialQuestions : { [crypto.randomUUID()]: defaultSingleChoiceQuestion }
  );
  const [activeQuestion, setActiveQuestion] = React.useState<string>(Object.keys(questions)[0]);

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
          const newOptions = [...question.answerOptions, { id: 0, questionId: question.id, index: question.answerOptions.length, text: "", matchingPair: "", isCorrect: false }];
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

  const handleDragEnd = (event: any) => {
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

  return {
    questions,
    setQuestions,
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
  };
}