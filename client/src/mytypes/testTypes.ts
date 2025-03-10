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
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOption[];
}

export type QuestionMap = { [key: string]: Question };

export interface AnswerOption {
  id: number;
  questionId: number;
  index: number;
  text: string;
  isCorrect: boolean;
}

export const defaultQuestion = {
  id: 0,
  testId: 0,
  index: 0,
  text: "",
  answerOptions: [
    { id: 0, questionId: 0, index: 0, text: "", isCorrect: true },
    { id: 0, questionId: 0, index: 1, text: "", isCorrect: false }
  ]
};