import { BubbleMenu, Editor } from "@tiptap/react";
import { Box, Divider } from "@mui/material";
import { FormatBold, FormatItalic, FormatStrikethrough, FormatUnderlined } from "@mui/icons-material";
import { FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify } from "@mui/icons-material";
import { Title } from '@mui/icons-material';
import { FormatListBulleted, FormatListNumbered } from '@mui/icons-material';
import { Code } from '@mui/icons-material';
import StyledIconButton from "@components/StyledIconButton";

interface Props {
  editor: Editor;
}

const CustomBubbleMenu = ({ editor }: Props) => {
  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'bottom' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <StyledIconButton onClick={() => editor.chain().focus().toggleBold().run()}><FormatBold /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalic /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleStrike().run()}><FormatStrikethrough /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleUnderline().run()}><FormatUnderlined /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("left").run()}><FormatAlignLeft /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("center").run()}><FormatAlignCenter /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("right").run()}><FormatAlignRight /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setTextAlign("justify").run()}><FormatAlignJustify /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Title style={{ fontSize: 24 }}/></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Title /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().setParagraph().run()}><Title style={{ fontSize: 16 }}/></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted /></StyledIconButton>
        <StyledIconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered /></StyledIconButton>
        <Divider orientation="vertical" variant="middle" flexItem></Divider>
        <StyledIconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code /></StyledIconButton>
      </Box>
    </BubbleMenu>
  );
};

export default CustomBubbleMenu;