export interface Test {
  id: number;
  userId: number;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
}

export interface TestDto {
  title: string;
  description: string;
  questions: Question[];
}

export interface TestForSchemas {
  title: string;
  description: string;
}

export interface Question {
  id: number;
  testId: number;
  type: number;
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOption[];
  correctAnswer?: string;
}

export type QuestionMap = { [key: string]: Question };

export interface AnswerOption {
  id: number;
  questionId: number;
  index: number;
  text: string;
  isCorrect: boolean;
  matchingPair?: string;
}

export const QUESTION_MIN = 1;
export const QUESTION_MAX = 50;
export const ANSWER_OPTION_MIN = 2;
export const ANSWER_OPTION_MAX = 5;
export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export const defaultSingleChoiceQuestion: Question = {
  id: 0,
  testId: 0,
  type: 0,
  index: 0,
  text: "",
  answerOptions: [
    { id: 0, questionId: 0, index: 0, text: "", isCorrect: true },
    { id: 0, questionId: 0, index: 1, text: "", isCorrect: false }
  ]
};

export const defaultMultipleChoiceQuestion: Question = {
  id: 0,
  testId: 0,
  type: 0,
  index: 0,
  text: "",
  answerOptions: [
    { id: 0, questionId: 0, index: 0, text: "", isCorrect: true },
    { id: 0, questionId: 0, index: 1, text: "", isCorrect: false }
  ]
};

export const defaultMatchingQuestion: Question = {
  id: 0,
  testId: 0,
  type: 0,
  index: 0,
  text: "",
  answerOptions: [
    { id: 0, questionId: 0, index: 0, text: "", matchingPair: "", isCorrect: false },
    { id: 0, questionId: 0, index: 1, text: "", matchingPair: "", isCorrect: false }
  ]
};

export const defaultFillInTheBlankQuestion: Question = {
  id: 0,
  testId: 0,
  type: 0,
  index: 0,
  text: "",
  correctAnswer: "",
  answerOptions: []
};

export const questionTypes = [
  { value: 0, label: 'Один правильный ответ' },
  { value: 1, label: 'Несколько правильных ответов' },
  { value: 2, label: 'Соответствие' },
  { value: 3, label: 'Заполнение пропущенного слова' }
];