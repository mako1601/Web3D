import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateUser, updatePassword } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";

// Определяем интерфейсы для данных форм
interface UpdateProfileData {
  lastName: string;
  firstName: string;
  middleName?: string;
}

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Схема валидации для профиля
const profileSchema = yup.object().shape({
  lastName: yup.string().required("Введите фамилию"),
  firstName: yup.string().required("Введите имя"),
  middleName: yup.string().optional(),
});

// Схема валидации для пароля
const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required("Введите старый пароль").min(6, "Минимум 6 символов"),
  newPassword: yup.string().required("Введите новый пароль").min(6, "Минимум 6 символов"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
    .required("Подтвердите новый пароль"),
});

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");

  // Форма обновления профиля
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      lastName: user?.lastName || "",
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
    },
  });

  // Форма изменения пароля
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset,
  } = useForm<UpdatePasswordData>({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: UpdateProfileData) => {
    setLoading(true);
    try {
      await updateUser(user!.id, data);
      setUser({ ...user!, ...data });
      setSuccessMessage("Профиль успешно обновлен!");
    } catch (error) {
      console.error("Ошибка обновления профиля", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: UpdatePasswordData) => {
    setLoading(true);
    setOldPasswordError(""); // Сбрасываем ошибку перед запросом
    try {
      await updatePassword(user!.id, data);
      setPasswordSuccess("Пароль успешно изменен!");
      reset();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404 && error.response.data === "Не верный пароль") {
          setOldPasswordError("Неверный старый пароль");
        } else {
          console.error("Ошибка изменения пароля", error.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Редактирование профиля
      </Typography>

      <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
        <TextField {...registerProfile("lastName")} label="Фамилия" fullWidth margin="normal" error={!!profileErrors.lastName} helperText={profileErrors.lastName?.message} />
        <TextField {...registerProfile("firstName")} label="Имя" fullWidth margin="normal" error={!!profileErrors.firstName} helperText={profileErrors.firstName?.message} />
        <TextField {...registerProfile("middleName")} label="Отчество" fullWidth margin="normal" />

        {successMessage && <Typography color="success.main">{successMessage}</Typography>}

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Изменение пароля
      </Typography>

      <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
        <TextField
          {...registerPassword("oldPassword")}
          type="password"
          label="Старый пароль"
          fullWidth
          margin="normal"
          error={!!passwordErrors.oldPassword || !!oldPasswordError}
          helperText={passwordErrors.oldPassword?.message || oldPasswordError}
        />
        <TextField
          {...registerPassword("newPassword")}
          type="password"
          label="Новый пароль"
          fullWidth
          margin="normal"
          error={!!passwordErrors.newPassword}
          helperText={passwordErrors.newPassword?.message}
        />
        <TextField
          {...registerPassword("confirmNewPassword")}
          type="password"
          label="Подтверждение нового пароля"
          fullWidth
          margin="normal"
          error={!!passwordErrors.confirmNewPassword}
          helperText={passwordErrors.confirmNewPassword?.message}
        />

        {passwordSuccess && <Typography color="success.main">{passwordSuccess}</Typography>}

        <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? "Изменение..." : "Изменить пароль"}
        </Button>
      </form>
    </Box>
  );
};

export default ProfileForm;
