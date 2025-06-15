import * as React from 'react';
import { EditorContent } from '@tiptap/react';
import { Button, Box, FormControl, FormLabel, Backdrop, CircularProgress, TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogActions, Select, MenuItem, Typography, SelectChangeEvent } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import BubbleMenu from '@components/BubbleMenu';
import ContentContainer from '@components/ContentContainer';
import StyledEditorContainer from '@components/StyledEditorContainer';
import { ArticleForSchemas, CONTENT_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '@mytypes/articleTypes';
import { Test } from '@mytypes/testTypes';

interface ArticleFormProps {
  mode: 'create' | 'edit';
  loading: boolean;
  localImages: React.MutableRefObject<Map<string, File>>;
  register: any;
  handleSubmit: any;
  errors: any;
  tests: Test[] | null;
  titleLength: number;
  setTitleLength: (length: number) => void;
  descriptionLength: number;
  setDescriptionLength: (length: number) => void;
  contentLength: number;
  setIsDirty: (dirty: boolean) => void;
  editor: any;
  onSubmit: (data: ArticleForSchemas) => Promise<void>;
  onDelete?: () => Promise<void>;
  canvas: HTMLCanvasElement | null;
  setCanvasContainerRef: (ref: HTMLDivElement | null) => void;
  closeBackdrop: () => void;
  handleRunCode: () => void;
  cursorPos: { top: number; left: number };
  relatedTestId: number | null;
  setRelatedTestId: (id: number | null) => void;
}

export default function ArticleForm({
  mode,
  loading,
  localImages,
  register,
  handleSubmit,
  errors,
  tests,
  titleLength,
  setTitleLength,
  descriptionLength,
  setDescriptionLength,
  contentLength,
  setIsDirty,
  editor,
  onSubmit,
  onDelete,
  canvas,
  setCanvasContainerRef,
  closeBackdrop,
  handleRunCode,
  cursorPos,
  relatedTestId,
  setRelatedTestId
}: ArticleFormProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleDialogClickOpen = () => { setOpenDialog(true); };
  const handleDialogClose = () => { setOpenDialog(false); };

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    const value = event.target.value;
    setRelatedTestId(value === "" ? null : Number(value));
  };

  return (
    <Page>
      {mode === 'edit' && (
        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>
            Вы действительно хотите удалить учебный материал?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => { handleDialogClose(); onDelete?.(); }}>Да</Button>
            <Button autoFocus onClick={handleDialogClose}>Нет</Button>
          </DialogActions>
        </Dialog>
      )}

      <Header />
      <ContentContainer gap="1rem">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'space-between' }}>
            <Box display="flex" gap={2} sx={{ width: '100%' }}>
              <FormControl sx={{ flex: 2 }}>
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
                    setIsDirty(true);
                  }}
                />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, }}>
                  <Typography sx={{ margin: '0 0 7px 0' }} color='textSecondary'>
                    Выберите тест
                  </Typography>
                  <Tooltip
                    title="Выберите тест, связанный с учебным материалом, чтобы студенты могли перейти к прохождению тестирования по изученному материалу"
                    placement="top"
                  >
                    <Box sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </Box>
                <Select
                  {...register("relatedTestId")}
                  value={relatedTestId && tests?.some(t => t.id === relatedTestId) ? relatedTestId : ""}
                  onChange={handleChange}
                  displayEmpty
                  disabled={!tests || tests.length === 0}
                  renderValue={(selected) => {
                    if (!selected || !tests?.some(t => t.id === selected)) {
                      return <Typography color="textSecondary">Не выбрано</Typography>;
                    }
                    return tests.find(t => t.id === selected)?.title || selected;
                  }}
                >
                  <MenuItem value="">
                    <em>Не выбрано</em>
                  </MenuItem>
                  {tests?.map(test => (
                    <MenuItem key={test.id} value={test.id}>
                      {test.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание
                <Box>{descriptionLength}/{DESCRIPTION_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("description")}
                fullWidth
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
                  setIsDirty(true);
                }}
              />
            </FormControl>
          </PageCard>
          <PageCard
            className="page-card"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              position: 'relative',
              overflow: 'auto'
            }}>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box display="flex" flexDirection="row" gap={0.5}>
                  Текст
                  <Tooltip
                    title="Редактор поддерживает математические формулы через LaTeX, например: $a^2 + b^2 = c^2$"
                    placement="bottom"
                  >
                    <Box sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </Box>
                <Box>{contentLength}/{CONTENT_MAX_LENGTH}</Box>
              </FormLabel>
              {editor && <BubbleMenu editor={editor} localImages={localImages} />}
              <StyledEditorContainer>
                <Box
                  sx={{
                    '.tiptap': {
                      '& pre': {
                        background: 'rgba(97, 97, 97, 0.1)',
                        border: '1px solid green',
                        padding: '1rem',
                        color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
                      }
                    }
                  }}
                >
                  <EditorContent editor={editor} />
                </Box>
              </StyledEditorContainer>
              {errors.content && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.375, ml: 1.75, mr: 1.75 }}>
                  {errors.content.message}
                </Box>
              )}
            </FormControl>
            <Box display="flex" flexDirection="column" gap={5}>
              <Button
                type="submit"
                sx={{ alignSelf: 'center', width: '10rem' }}
                variant={loading ? "outlined" : "contained"}
                disabled={loading}
              >
                {loading ? "Сохранение…" : "Сохранить"}
              </Button>
              {mode === 'edit' && (
                <Button
                  type="button"
                  sx={{ alignSelf: 'center', width: '10rem' }}
                  variant={loading ? "outlined" : "contained"}
                  disabled={loading}
                  color="error"
                  onClick={handleDialogClickOpen}
                >
                  Удалить
                </Button>
              )}
            </Box>
            {editor && editor.isActive('codeRunner') && (
              <IconButton
                title="Выполнить код"
                onClick={handleRunCode}
                style={{ background: 'transparent' }}
                sx={{
                  position: 'absolute',
                  top: `${cursorPos.top}px`,
                  left: `${cursorPos.left}px`,
                  padding: 0,
                  zIndex: 1,
                  transform: 'translateY(-50%)',
                  border: 'transparent',
                  transition: 'transform 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-50%) scale(1.4)',
                    color: 'rgb(0, 200, 50)',
                  }
                }}
              >
                <PlayArrowRoundedIcon sx={{ color: 'rgb(12, 150, 0)', '&:hover': { color: 'rgb(0, 200, 50)' } }} />
              </IconButton>
            )}
          </PageCard>
        </Box>
      </ContentContainer>

      {/* loading */}
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
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* canvas */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          overflow: 'auto',
        }}
        open={!!canvas}
        onClick={closeBackdrop}
      >
        {canvas && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
            ref={el => setCanvasContainerRef(el)}
          />
        )}
      </Backdrop>
    </Page>
  );
}