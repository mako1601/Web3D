import { useState, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
//import Markdown from "@tiptap/extension-markdown";
import { Button, Box } from "@mui/material";

const TiptapEditor = () => {
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, CodeBlock, Image],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleSave = useCallback(() => {
    console.log("Сохраненный контент:", content);
  }, [content]);

  const addImage = useCallback(() => {
    const url = prompt("Введите URL изображения:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Button onClick={() => editor?.chain().focus().toggleBold().run()} variant="contained">
          Bold
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleItalic().run()} variant="contained">
          Italic
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} variant="contained">
          H2
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleBulletList().run()} variant="contained">
          List
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} variant="contained">
          Code
        </Button>
        <Button onClick={addImage} variant="contained">
          Add Image
        </Button>
      </Box>
      <EditorContent editor={editor} />
      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
        Сохранить
      </Button>
    </Box>
  );
};

export default TiptapEditor;
