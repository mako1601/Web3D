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
  // TODO: Протестировать
  content: yup.string()
  .transform((value) => {
    const cleaned = value
      .replace(/<p><\/p>/g, "")
      .replace(/<br>/g, "")
      .trim();
    return cleaned === "" ? null : cleaned;
  })
  .nullable()
  .required("Обязательное поле")
  .max(30007, "Превышен лимит 30000 символов"),
});