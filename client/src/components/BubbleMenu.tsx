import * as React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { Box, Divider } from '@mui/material';
import { FormatBold, FormatItalic, FormatStrikethrough, FormatUnderlined } from '@mui/icons-material';
import { FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify } from '@mui/icons-material';
import { Title, FormatListBulleted, FormatListNumbered, Code, Terminal } from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
import StyledIconButton from '@components/StyledIconButton';

interface Props {
  editor: Editor;
  localImages: React.MutableRefObject<Map<string, File>>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FORMATS = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGES = 30;

const CustomBubbleMenu = ({ editor, localImages }: Props) => {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FORMATS.includes(file.type)) {
      alert("Недопустимый формат, разрешенные форматы: PNG, JPEG, WEBP");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("Файл слишком большой, максимальный размер — 5МБ");
      return;
    }
    if (localImages.current.size >= MAX_IMAGES) {
      alert(`Достигнут лимит на количество изображений (${MAX_IMAGES})`);
      return;
    }
    const localUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: localUrl }).run();
    localImages.current.set(localUrl, file);
  };

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'bottom', maxWidth: "1000px" }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        <StyledIconButton onClick={() => editor.chain().focus().toggleBold().run()} title="Полужирный"><FormatBold /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив"><FormatItalic /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleStrike().run()} title="Зачеркнутый"><FormatStrikethrough /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleUnderline().run()} title="Подчеркнутый"><FormatUnderlined /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Выровнять по левому краю"><FormatAlignLeft /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Выровнять по цетру"><FormatAlignCenter /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Выровнять по правому краю"><FormatAlignRight /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Выровнять по ширине"><FormatAlignJustify /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок"><Title style={{ fontSize: 24 }} /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Подзаголовок"><Title /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setParagraph().run()} title="Основной текст"><Title style={{ fontSize: 16 }} /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleBulletList().run()} title="Маркеры"><FormatListBulleted /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерация"><FormatListNumbered /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Вставка кода"><Code /></StyledIconButton>
        <StyledIconButton component="label" title="Вставка изображения">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <ImageIcon sx={{ margin: '-2px' }} />
        </StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleCodeRunner().run()} title="Исполняемый код"><Terminal /></StyledIconButton>
      </Box>
    </BubbleMenu>
  );
};

export default CustomBubbleMenu;