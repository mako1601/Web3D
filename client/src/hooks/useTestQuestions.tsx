import { useState } from "react";
import { QuestionMap, defaultQuestion } from "@mytypes/testTypes";

const QUESTION_MIN = 1;
const QUESTION_MAX = 50;
const ANSWER_OPTION_MIN = 2;
const ANSWER_OPTION_MAX = 4;

export function useTestQuestions(initialQuestions: QuestionMap = {}) {
  const [questions, setQuestions] = useState<QuestionMap>(() =>
    Object.keys(initialQuestions).length > 0 ? initialQuestions : { [crypto.randomUUID()]: defaultQuestion }
  );
  const [activeQuestion, setActiveQuestion] = useState<string>(Object.keys(questions)[0]);

  const addQuestion = () => {
    if (Object.keys(questions).length < QUESTION_MAX) {
      const newKey = crypto.randomUUID();
      setQuestions(prev => ({ ...prev, [newKey]: defaultQuestion }));
      setActiveQuestion(newKey);
    }
  };

  const updateQuestion = (key: string, newText: string) => {
    setQuestions(prev => ({ ...prev, [key]: { ...prev[key], text: newText } }));
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
        const newOptions = [...question.answerOptions, { id: 0, questionId: question.id, index: question.answerOptions.length, text: "", isCorrect: false }];
        return { ...prev, [key]: { ...question, answerOptions: newOptions } };
      }
      return prev;
    });
  };

  const updateAnswerOption = (key: string, index: number, text: string) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question) {
        const newOptions = question.answerOptions.map((opt, i) => i === index ? { ...opt, text } : opt);
        return { ...prev, [key]: { ...question, answerOptions: newOptions } };
      }
      return prev;
    });
  };

  const setCorrectAnswer = (key: string, index: number) => {
    setQuestions(prev => {
      const question = prev[key];
      if (question) {
        const newOptions = question.answerOptions.map((opt, i) => ({ ...opt, isCorrect: i === index }));
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