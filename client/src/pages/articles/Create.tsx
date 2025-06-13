import * as React from 'react';
import { useArticleForm } from '@hooks/useArticles';
import ArticleForm from '@components/ArticleForm';
import { ArticleForSchemas } from '@mytypes/articleTypes';

export default function CreateArticle() {
  const [loading, setLoading] = React.useState(false);
  const localImages = React.useRef<Map<string, File>>(new Map());
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
  const [canvasContainerRef, setCanvasContainerRef] = React.useState<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    contentLength,
    setContentLength,
    setIsDirty,
    useArticleEditor,
    useUploadImages,
    useCreateArticle
  } = useArticleForm();

  const editor = useArticleEditor(setValue, setContentLength, setIsDirty);
  const uploadImages = useUploadImages(localImages);
  const createArticle = useCreateArticle();

  React.useEffect(() => {
    (window as any).onCanvasGenerated = (generatedCanvas: HTMLCanvasElement) => {
      setCanvas(generatedCanvas);
    };
    return () => {
      delete (window as any).onCanvasGenerated;
    };
  }, []);

  React.useEffect(() => {
    if (canvas && canvasContainerRef) {
      canvasContainerRef.appendChild(canvas);
    }
  }, [canvas, canvasContainerRef]);

  const closeBackdrop = () => {
    if (canvasContainerRef && canvas) {
      canvasContainerRef.removeChild(canvas);
    }
    setCanvas(null);
  };

  const handleRunCode = React.useCallback(() => {
    if (editor) {
      editor.commands.executeCode();
    }
  }, [editor]);

  const getCursorPosition = () => {
    if (!editor) return { top: 0, left: 0 };
    const { anchor } = editor.state.selection;
    const coords = editor.view.coordsAtPos(anchor);
    const editorContainer = editor.view.dom.closest('.page-card');
    if (!editorContainer) return { top: 0, left: 0 };
    const containerRect = editorContainer.getBoundingClientRect();
    const relativeTop = coords.top - containerRect.top + editorContainer.scrollTop + 5;
    const relativeLeft = containerRect.width - 80;
    return { top: relativeTop, left: relativeLeft };
  };

  const [cursorPos, setCursorPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!editor) return;
    const updatePosition = () => {
      setCursorPos(getCursorPosition());
    };
    editor.on('selectionUpdate', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  const onSubmit = async (data: ArticleForSchemas) => {
    setLoading(true);
    await createArticle(editor!, data, uploadImages);
    setLoading(false);
  };

  return (
    <ArticleForm
      mode="create"
      loading={loading}
      localImages={localImages}
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      titleLength={titleLength}
      setTitleLength={setTitleLength}
      descriptionLength={descriptionLength}
      setDescriptionLength={setDescriptionLength}
      contentLength={contentLength}
      setIsDirty={setIsDirty}
      editor={editor}
      onSubmit={onSubmit}
      canvas={canvas}
      setCanvasContainerRef={setCanvasContainerRef}
      closeBackdrop={closeBackdrop}
      handleRunCode={handleRunCode}
      cursorPos={cursorPos}
    />
  );
}