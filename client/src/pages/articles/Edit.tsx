import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Box, FormControl, TextField, FormLabel, CircularProgress, Backdrop } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import debounce from 'lodash.debounce';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import BubbleMenu from '@components/BubbleMenu';
import ContentContainer from '@components/ContentContainer';
import { getArticleById, updateArticle } from '@api/articleApi';
import { useAuth } from '@context/AuthContext';
import { articleSchema } from '@schemas/articleSchemas';
import { PageProps } from '@mytypes/commonTypes';
import { Article, ArticleDto } from '@mytypes/articleTypes';
import StyledEditorContainer from '@components/StyledEditorContainer';
import usePreventUnload from "@hooks/usePreventUnload";
import { deleteImage, uploadImage } from '@api/cloudinaryApi';

export default function EditArticle({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = Number(id);

  const { user, loading: userLoading } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());
  const [formDirty, setFormDirty] = React.useState(false);
  usePreventUnload(formDirty);

  const TITLE_MAX_LENGTH = 60;
  const DESCRIPTION_MAX_LENGTH = 250;
  const CONTENT_MAX_LENGTH = 30000;
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);
  const [contentLength, setContentLength] = React.useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<ArticleDto>({
    resolver: yupResolver(articleSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "<p></p>"
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.extend({
        renderHTML({ HTMLAttributes }) {
          return ["img", { ...HTMLAttributes, style: "max-width:100%; height:auto;" }];
        },
      }).configure({
        inline: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      })
    ],
    content: "",
    onUpdate: debounce(({ editor }) => {
      setValue("content", editor.getHTML(), { shouldValidate: true });
      setContentLength(editor.getText().length);
      setFormDirty(true);
    }, 300),
  });

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

  const extractImageIdFromUrl = (url: string): string => {
    const match = url.match(/\/v\d+\/([^\/]+)\.\w+$/);
    return match ? match[1] : "";
  };

  const extractImageUrls = (html: string): string[] => {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = html;
    const images = Array.from(tempContainer.querySelectorAll("img"));
    return images.map((img) => img.getAttribute("src") || "");
  };

  const uploadImages = async (html: string): Promise<string> => {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = html;
    const imageElements = Array.from(tempContainer.querySelectorAll("img"));
    const imageUploadPromises = imageElements.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || !localImages.current.has(src)) return;
      const file = localImages.current.get(src);
      if (file) {
        try {
          const cloudUrl = await uploadImage(file);
          img.setAttribute("src", cloudUrl);
        } catch (e: any) {
          throw new Error("Файл не найден");
        }
      }
    });
    await Promise.all(imageUploadPromises);
    return tempContainer.innerHTML;
  };

  const onSubmit = async (data: ArticleDto) => {
    try {
      setLoading(true);
      const updatedContent = await uploadImages(data.content);
      const currentImageUrls = extractImageUrls(updatedContent);
      const deletedImages = initialImageUrls.current.filter((url) => !currentImageUrls.includes(url));
      for (const imageUrl of deletedImages) {
        await deleteImage(extractImageIdFromUrl(imageUrl));
      }
      const updatedData = { ...data, content: updatedContent };
      setLoading(false);
      await updateArticle(article!.id, updatedData);
      setSeverity("success");
      setMessage("Учебный материал успешно обновлён!");
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else if (e.message) {
        setMessage(e.message);
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoading(false);
    }
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