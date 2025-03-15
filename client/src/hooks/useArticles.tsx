import * as React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createArticle, updateArticle } from "@api/articleApi";
import { deleteImage, uploadImage } from "@api/cloudinaryApi";
import { ArticleDto } from "@mytypes/articleTypes";
import usePreventUnload from "./usePreventUnload";
import { articleSchema } from "@schemas/articleSchemas";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import debounce from "lodash.debounce";
import Image from '@tiptap/extension-image';
import { extractImageIdFromUrl } from "@utils/extractImageIdFromUrl";

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
  } = useForm<ArticleDto>({
    resolver: yupResolver(articleSchema),
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
    setFormDirty,
  };
};

export const useArticleEditor = (setValue: any, setContentLength: any, setFormDirty: any) => {
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
    ],
    content: `<p></p>`,
    onUpdate: debounce(({ editor }) => {
      setValue("content", editor.getHTML(), { shouldValidate: true });
      setContentLength(editor.getText().length);
      setFormDirty(true);
    }, 300),
  });
};

export const useCreateArticle = (setSeverity: any, setMessage: any, setOpen: any, navigate: any) => {
  return async (data: ArticleDto, uploadImages: (html: string) => Promise<string>) => {
    try {
      const updatedContent = await uploadImages(data.content);
      const updatedData = { ...data, content: updatedContent };
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
  return async (id: number, data: ArticleDto, uploadImages: (html: string) => Promise<string>, initialImageUrls: React.MutableRefObject<string[]>) => {
    try {
      const updatedContent = await uploadImages(data.content);
      const currentImageUrls = extractImageUrls(updatedContent);
      const deletedImages = initialImageUrls.current.filter(url => !currentImageUrls.includes(url));
      for (const imageUrl of deletedImages) {
        await deleteImage(extractImageIdFromUrl(imageUrl));
      }
      const updatedData = { ...data, content: updatedContent };
      await updateArticle(id, updatedData);
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
  return async (html: string): Promise<string> => {
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
};

export const extractImageUrls = (html: string): string[] => {
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = html;
  const images = Array.from(tempContainer.querySelectorAll("img"));
  return images.map((img) => img.getAttribute("src") || "");
};