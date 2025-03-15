import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Box, FormControl, TextField, FormLabel, CircularProgress, Backdrop } from '@mui/material';
import { EditorContent } from '@tiptap/react';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import BubbleMenu from '@components/BubbleMenu';
import ContentContainer from '@components/ContentContainer';
import StyledEditorContainer from '@components/StyledEditorContainer';
import { getArticleById } from '@api/articleApi';
import { useAuth } from '@context/AuthContext';
import { PageProps } from '@mytypes/commonTypes';
import { Article, ArticleDto, CONTENT_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '@mytypes/articleTypes';
import { extractImageUrls, useArticleEditor, useArticleForm, useEditArticle, useUploadImages } from '@hooks/useArticles';

export default function EditArticle({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = Number(id);

  const { user, loading: userLoading } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    reset,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    contentLength,
    setContentLength,
    setFormDirty
  } = useArticleForm();
  
  const editor = useArticleEditor(setValue, setContentLength, setFormDirty);
  const uploadImages = useUploadImages(localImages);
  const editArticle = useEditArticle(setSeverity, setMessage, setOpen, navigate);

  React.useEffect(() => {
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
        setTitleLength(data.title.length);
        setDescriptionLength(data.description.length);
      } catch (error) {
        console.error("Ошибка загрузки статьи: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId, user, userLoading]);

  React.useEffect(() => {
    if (article) {
      const imageUrls = extractImageUrls(article.content);
      initialImageUrls.current = imageUrls;
      reset({
        title: article.title,
        description: article.description,
        content: article.content,
      });
      if (editor) {
        editor.commands.setContent(article.content);
        setContentLength(editor.getText().length);
      }
    }
  }, [article, reset, editor]);

  const onSubmit = async (data: ArticleDto) => {
    setLoading(true);
    await editArticle(article!.id, data, uploadImages, initialImageUrls);
    setLoading(false);
  };

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Название
                <Box>{titleLength}/{TITLE_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("title")}
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > TITLE_MAX_LENGTH) {
                    target.value = target.value.slice(0, TITLE_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setTitleLength(e.target.value.length);
                  setFormDirty(true);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание
                <Box>{descriptionLength}/{DESCRIPTION_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!errors.description}
                helperText={errors.description?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > DESCRIPTION_MAX_LENGTH) {
                    target.value = target.value.slice(0, DESCRIPTION_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setDescriptionLength(e.target.value.length);
                  setFormDirty(true);
                }}
              />
            </FormControl>
          </PageCard>
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Текст
                <Box>{contentLength}/{CONTENT_MAX_LENGTH}</Box>
              </FormLabel>
              {editor && <BubbleMenu editor={editor} localImages={localImages} />}
              <StyledEditorContainer>
                <EditorContent editor={editor} />
              </StyledEditorContainer>
              {errors.content && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.375, ml: 1.75, mr: 1.75 }}>
                  {errors.content.message}
                </Box>
              )}
            </FormControl>
            <Button
              type="submit"
              sx={{ alignSelf: 'center', width: '10rem' }}
              variant={loading ? "outlined" : "contained"}
              disabled={loading}
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </PageCard>
        </Box>
      </ContentContainer>
      <Footer />
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        open={loading || userLoading || !article || !editor}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page>
  );
}