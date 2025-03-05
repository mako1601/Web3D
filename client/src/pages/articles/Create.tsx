import * as React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Box, FormControl, TextField, FormLabel } from '@mui/material';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEditor, EditorContent } from '@tiptap/react';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import BubbleMenu from '@components/BubbleMenu';
import ContentContainer from '@components/ContentContainer';
import StyledEditorContainer from '@components/StyledEditorContainer';
import { createArticle } from '@api/articleApi';
import { PageProps } from '@mytypes/commonTypes';
import { ArticleDto } from '@mytypes/articleTypes';
import { articleSchema } from '@schemas/articleSchemas';

export default function CreateArticle({ setSeverity, setMessage, setOpen }: PageProps) {
  const [loading, setLoading] = React.useState(false);
  const content = "<p></p>";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ArticleDto>({
    resolver: yupResolver(articleSchema),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content
  });

  React.useEffect(() => {
    if (editor) {
      setValue("content", editor.getHTML());
    }
  }, [editor?.getHTML()]);

  const onSubmit = async (data: ArticleDto) => {
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
      {editor && <BubbleMenu editor={editor}/>}
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