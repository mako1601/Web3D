import { api } from './axiosInstance';

const ROUTE = "/cloudinary";

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`${ROUTE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.url;
};

export const deleteImage = async (id: string): Promise<void> => {
  await api.delete(`${ROUTE}/delete/${id}`);
};