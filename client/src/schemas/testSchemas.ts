import * as yup from 'yup';

export const testSchema = yup.object().shape({
  title: yup.string()
    .required("Обязательное поле")
    .max(60, "Название не может превышать 60 символов")
    .trim(),
  description: yup.string()
    .max(250, "Описание не может превышать 250 символов")
    .trim()
    .default("")
});