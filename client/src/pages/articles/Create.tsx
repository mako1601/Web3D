import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Box, FormControl, TextField, FormLabel } from '@mui/material';

import Page from '../../components/Page';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageCard from '../../components/PageCard';
import ContentContainer from '../../components/ContentContainer';
import { ArticleData, createArticle } from '../../api/articleApi';
import { PageProps } from '../../App';

const articleSchema = yup.object().shape({
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

export default function CreateArticle({ setSeverity, setMessage, setOpen }: PageProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: articleErrors }
  } = useForm<ArticleData>({
    resolver: yupResolver(articleSchema)
  });

  const onSubmit = async (data: ArticleData) => {
    try {
      setLoading(true);
      await createArticle(data);
      setSeverity("success");
      setMessage("Учебный материал успешно создан!");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoading(false);
    }
  }

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <PageCard>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel>Название</FormLabel>
              <TextField
                {...register("title")}
                fullWidth
                error={!!articleErrors.title}
                helperText={articleErrors.title?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Описание</FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!articleErrors.description}
                helperText={articleErrors.description?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Текст</FormLabel>
              <TextField
                {...register("content")}
                fullWidth
                multiline
                error={!!articleErrors.content}
                helperText={articleErrors.content?.message}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant={loading ? "outlined" : "contained"}
              disabled={loading}
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </Box>
        </PageCard>
      </ContentContainer>
      <Footer />
    </Page>
  );
};