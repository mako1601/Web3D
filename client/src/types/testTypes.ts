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
  questions: QuestionDto[];
}

export interface TestForCreate {
  title: string;
  description: string;
  questions: QuestionForCreate[];
}

export interface Question {
  id: number;
  testId: number;
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOption[];
}

export interface QuestionDto {
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOptionDto[];
}

export interface QuestionForCreate {
  id: string;
  index: number;
  text: string;
  imageUrl?: string;
  answerOptions: AnswerOptionDto[];
}

export interface AnswerOption {
  id: number;
  questionId: number;
  index: number;
  text: string;
  isCorrect: boolean;
}

export interface AnswerOptionDto {
  index: number;
  text: string;
  isCorrect: boolean;
}