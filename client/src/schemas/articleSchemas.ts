import * as yup from 'yup';

export const articleSchema = yup.object().shape({
  title: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(60, "Название не может превышать 60 символов"),
  description: yup.string()
    .trim()
    .optional()
    .max(250, "Описание не может превышать 250 символов")
    .default(""),
  content: yup.string()
    .trim()
    .optional()
    .max(10000, "Привышен лимит 10000 символов")
    .default("")
});