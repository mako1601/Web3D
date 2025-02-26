import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, FormControl, FormLabel, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import Page from '../components/Page';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContentContainer from '../components/ContentContainer';
import { updatePassword, updateUser, UpdUserData, UpdUserPass } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { PageProps } from '../App';
import { refreshToken } from '../api/axiosInstance';
import PageCard from '../components/PageCard';

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const profileSchema = yup.object().shape({
  lastName: yup.string()
    .required("Обязательное поле")
    .max(64, "Фамилия не может превышать 64 символа")
    .matches(/^\S*$/, "Фамилия не должна содержать пробелы"),
  firstName: yup.string()
    .required("Обязательное поле")
    .max(64, "Имя не может превышать 64 символа")
    .matches(/^\S*$/, "Имя не должно содержать пробелы"),
  middleName: yup.string()
    .optional()
    .max(64, "Отчество не может превышать 64 символа")
    .matches(/^\S*$/, "Отчество не должно содержать пробелы")
});

const passwordSchema = yup.object().shape({
  oldPassword: yup.string()
    .required("Введите старый пароль")
    .min(6, "Пароль не может содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
  newPassword: yup.string()
    .required("Введите новый пароль")
    .min(6, "Пароль должен содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
    .required("Подтвердите новый пароль"),
});

const Profile = ({ setSeverity, setMessage, setOpen }: PageProps) => {
  const { user, setUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdUserData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      lastName: user?.lastName || "",
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordData>({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: UpdUserData) => {
    try {
      setLoadingProfile(true);
      await updateUser(user!.id, data);
      await refreshToken();
      setUser({ ...user!, ...data });
      resetProfile(data);
      setSeverity("success");
      setMessage("Данные успешно изменены!");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (data: UpdatePasswordData) => {
    try {
      setLoadingPassword(true);
      const updUserPass: UpdUserPass = { oldPassword: data.oldPassword, newPassword: data.newPassword };
      await updatePassword(user!.id, updUserPass);
      resetPassword();
      setSeverity("success");
      setMessage("Пароль успешно изменен!");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoadingPassword(false);
    }
  };

  const handleToggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Typography variant="h4">
          Профиль пользователя
        </Typography>
        <Box display="flex" flexDirection="column" gap="2rem">
          <PageCard>
            <FormControl>
              <Typography variant="h5">
                Информация
              </Typography>
            </FormControl>
            <Box
              component="form"
              onSubmit={handleSubmitProfile(onSubmitProfile)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl>
                <FormLabel>
                  Фамилия
                </FormLabel>
                <TextField
                  {...registerProfile("lastName")}
                  fullWidth
                  placeholder="Иванов"
                  autoComplete="family-name"
                  error={!!profileErrors.lastName}
                  helperText={profileErrors.lastName?.message}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Имя
                </FormLabel>
                <TextField
                  {...registerProfile("firstName")}
                  fullWidth
                  placeholder="Иван"
                  autoComplete="given-name"
                  error={!!profileErrors.firstName}
                  helperText={profileErrors.firstName?.message}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Отчество
                </FormLabel>
                <TextField
                  {...registerProfile("middleName")}
                  fullWidth
                  placeholder="Иванович (необязательно)"
                  autoComplete="additional-name"
                  error={!!profileErrors.middleName}
                  helperText={profileErrors.middleName?.message}
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant={loadingProfile ? "outlined" : "contained"}
                disabled={loadingProfile}
              >
                {loadingProfile ? "Сохранение изменений…" : "Сохранить изменения"}
              </Button>
            </Box>
          </PageCard>

          <PageCard>
            <FormControl>
              <Typography variant="h5">
                Смена пароля
              </Typography>
            </FormControl>
            <Box
              component="form"
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl>
                <FormLabel>
                  Старый пароль
                </FormLabel>
                <TextField
                  {...registerPassword("oldPassword")}
                  fullWidth
                  placeholder="••••••"
                  autoComplete="new-password"
                  type={showOldPassword ? "text" : "password"}
                  error={!!passwordErrors.oldPassword}
                  helperText={passwordErrors.oldPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleOldPasswordVisibility}
                          edge="end"
                          title={showOldPassword ? "Спрятать пароль" : "Отобразить пароль"}
                          style={{ border: 0, backgroundColor: 'transparent' }}
                        >
                          {showOldPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Новый пароль
                </FormLabel>
                <TextField
                  {...registerPassword("newPassword")}
                  fullWidth
                  placeholder="••••••"
                  autoComplete="new-password"
                  type={showNewPassword ? "text" : "password"}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleNewPasswordVisibility}
                          edge="end"
                          title={showNewPassword ? "Спрятать пароль" : "Отобразить пароль"}
                          style={{ border: 0, backgroundColor: 'transparent' }}
                        >
                          {showNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Подтверждение нового пароля
                </FormLabel>
                <TextField
                  {...registerPassword("confirmNewPassword")}
                  fullWidth
                  placeholder="••••••"
                  autoComplete="new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  error={!!passwordErrors.confirmNewPassword}
                  helperText={passwordErrors.confirmNewPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmNewPasswordVisibility}
                          edge="end"
                          title={showConfirmNewPassword ? "Спрятать пароль" : "Отобразить пароль"}
                          style={{ border: 0, backgroundColor: 'transparent' }}
                        >
                          {showConfirmNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant={loadingPassword ? "outlined" : "contained"}
                disabled={loadingPassword}
              >
                {loadingPassword ? "Сохранение изменений…" : "Изменить пароль"}
              </Button>
            </Box>
          </PageCard>
        </Box>
      </ContentContainer>
      <Footer />
    </Page>
  );
};

export default Profile;