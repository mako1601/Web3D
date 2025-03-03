import * as yup from 'yup';
import uuid from 'react-native-uuid';

export const testSchema = yup.object().shape({
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