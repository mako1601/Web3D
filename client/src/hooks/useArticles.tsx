import * as React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import debounce from "lodash.debounce";
import { Editor, JSONContent, useEditor } from "@tiptap/react";
import Image from '@tiptap/extension-image';
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import { createArticle, updateArticle } from "@api/articleApi";
import { deleteImage, updateJson, uploadImage, uploadJson } from "@api/cloudinaryApi";
import { Article, ArticleDto, ArticleForSchemas } from "@mytypes/articleTypes";
import { articleSchema } from "@schemas/articleSchemas";
import { extractImageIdFromUrl } from "@utils/extractImageIdFromUrl";
import usePreventUnload from "@hooks/usePreventUnload";
import { CodeRunner } from "@components/CodeRunner";
import { extractJsonIdFromUrl } from "@utils/extractJsonIdFromUrl";

export const useArticleForm = () => {
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);
  const [contentLength, setContentLength] = React.useState(0);
  const [formDirty, setFormDirty] = React.useState(false);

  usePreventUnload(formDirty);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ArticleForSchemas>({
    resolver: yupResolver(articleSchema)
  });

  return {
    register,
    handleSubmit,
    setValue,
    reset,
    errors,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    contentLength,
    setContentLength,
    formDirty,
    setFormDirty
  };
};

export const useArticleEditor = (
  setValue: any,
  setContentLength: any,
  setFormDirty: any
) => {
  return useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image
        .extend({
          renderHTML({ HTMLAttributes }) {
            return ["img", { ...HTMLAttributes, style: "max-width: 100%; height: auto;" }];
          }
        })
        .configure({ inline: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeRunner
    ],
    content: `<p></p>`,
    onUpdate: debounce(({ editor }) => {
      setValue("content", editor.getText(), { shouldValidate: true });
      setContentLength(editor.getText().length);
      setFormDirty(true);
    }, 300),
  });
};

export const useCreateArticle = (setSeverity: any, setMessage: any, setOpen: any, navigate: any) => {
  return async (editor: Editor, data: ArticleForSchemas, uploadImages: (json: JSONContent) => Promise<JSONContent>) => {
    try {
      const updatedJson = await uploadImages(editor.getJSON());
      const jsonUrl = await uploadJson(JSON.stringify(updatedJson));
      const updatedData: ArticleDto = { title: data.title, description: data.description, contentUrl: jsonUrl };
      await createArticle(updatedData);
      setSeverity("success");
      setMessage("Учебный материал успешно создан!");
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
    }
  };
};

export const useEditArticle = (setSeverity: any, setMessage: any, setOpen: any, navigate: any) => {
  return async (editor: Editor, article: Article, data: ArticleForSchemas, uploadImages: (json: JSONContent) => Promise<JSONContent>, initialImageUrls: React.MutableRefObject<string[]>) => {
    try {
      const updatedJson = await uploadImages(editor.getJSON());
      const currentImageUrls = extractImageUrls(updatedJson);
      const deletedImages = initialImageUrls.current.filter(url => !currentImageUrls.includes(url));
      for (const imageUrl of deletedImages) {
        await deleteImage(extractImageIdFromUrl(imageUrl));
      }
      const jsonUrl = await updateJson(JSON.stringify(updatedJson), extractJsonIdFromUrl(article.contentUrl));
      const updatedData: ArticleDto = { title: data.title, description: data.description, contentUrl: jsonUrl };
      await updateArticle(article.id, updatedData);
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
    }
  };
};

export const useUploadImages = (localImages: React.MutableRefObject<Map<string, File>>) => {
  return async (json: any): Promise<any> => {
    if (!json || !json.content) return json;

    const processNode = async (node: any) => {
      if (node.type === "image" && node.attrs?.src) {
        const src = node.attrs.src;
        if (localImages.current.has(src)) {
          const file = localImages.current.get(src);
          if (file) {
            try {
              const cloudUrl = await uploadImage(file);
              node.attrs.src = cloudUrl;
            } catch (e: any) {
              throw new Error("Файл не найден");
            }
          }
        }
      }

      if (node.content) {
        await Promise.all(node.content.map(processNode));
      }
    };

    await Promise.all(json.content.map(processNode));
    return json;
  };
};

export const useFetchJsonFromUrl = async (url: string): Promise<any | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки JSON: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (e: any) {
    console.error("Ошибка при загрузке JSON:", e);
    return null;
  }
};

export const extractImageUrls = (json: any): string[] => {
  const urls: string[] = [];

  const traverse = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "image" && node.attrs?.src) {
      urls.push(node.attrs.src);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(json);
  return urls;
};