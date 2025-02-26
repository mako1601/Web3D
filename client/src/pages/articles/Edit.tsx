import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Box, FormControl, TextField, FormLabel, CircularProgress } from '@mui/material';

import Page from '../../components/Page';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageCard from '../../components/PageCard';
import ContentContainer from '../../components/ContentContainer';
import { ArticleData, ArticleDto, getArticleById, updateArticle } from '../../api/articleApi';
import { useAuth } from '../../context/AuthContext';
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

export default function EditArticle({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = Number(id);

  const { user, loading: userLoading } = useAuth();
  const [article, setArticle] = useState<ArticleDto | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ArticleData>({
    resolver: yupResolver(articleSchema),
    defaultValues: {
      title: "",
      description: "",
      content: ""
    }
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (isNaN(articleId)) { navigate("/", { replace: true }); return; }

    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await getArticleById(articleId);
        setArticle(data);
        if (Number(data.userId) !== Number(user.id)) {
          navigate("/", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Ошибка загрузки статьи: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, user, userLoading]);

  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        description: article.description,
        content: article.content,
      });
    }
  }, [article, reset]);

  if (loading || userLoading) {
    return (
      <Page>
        <Header />
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
        <Footer />
      </Page>
    );
  }

  if (!article) return null;

  const onSubmit = async (data: ArticleData) => {
    try {
      setLoading(true);
      await updateArticle(article.id, data);
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
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Описание</FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Текст</FormLabel>
              <TextField
                {...register("content")}
                fullWidth
                multiline
                error={!!errors.content}
                helperText={errors.content?.message}
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
}