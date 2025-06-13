import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { getArticleById } from '@api/articleApi';
import { useArticleForm } from '@hooks/useArticles';
import ArticleForm from '@components/ArticleForm';
import { Article, ArticleForSchemas } from '@mytypes/articleTypes';

export default function EditArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = Number(id);
  const { user, loading: userLoading } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
  const [canvasContainerRef, setCanvasContainerRef] = React.useState<HTMLDivElement | null>(null);

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
    setIsDirty,
    useArticleEditor,
    useEditArticle,
    useDeleteArticle,
    useFetchJsonFromUrl,
    useUploadImages,
    extractImageUrls
  } = useArticleForm();

  const editor = useArticleEditor(setValue, setContentLength, setIsDirty);
  const uploadImages = useUploadImages(localImages);
  const editArticle = useEditArticle();
  const deleteArticle = useDeleteArticle();

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
        setDescriptionLength(data.description?.length ?? 0);
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
    if (article && editor) {
      const fetchJson = async () => {
        const json = await useFetchJsonFromUrl(article.contentUrl);
        if (json) {
          editor.commands.setContent(json);
          setContentLength(editor.getText().length);
        }
      };

      fetchJson();
      initialImageUrls.current = extractImageUrls(editor.getHTML());
      setContentLength(editor.getText().length);
      reset({
        title: article.title,
        description: article.description,
        content: editor.getText()
      });
    }
  }, [article, reset, editor]);

  const onSubmit = async (data: ArticleForSchemas) => {
    setLoading(true);
    await editArticle(editor!, article!, data, uploadImages, initialImageUrls);
    setLoading(false);
  };

  const onDelete = async () => {
    setLoading(true);
    await deleteArticle(article!.id);
    setLoading(false);
  }

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

  return (
    <ArticleForm
      mode="edit"
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
      onDelete={onDelete}
      canvas={canvas}
      setCanvasContainerRef={setCanvasContainerRef}
      closeBackdrop={closeBackdrop}
      handleRunCode={handleRunCode}
      cursorPos={cursorPos}
    />
  );
}