import * as React from 'react';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Card from '../components/Card';
import Container from '../components/Container';
import { RegData, registerUser } from '../api/authApi';
import { getCurrentUser } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { PageProps } from '../App';

const schema = yup.object({
  login: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(64, "Логин не может превышать 64 символа")
    .matches(/^\S*$/, "Логин не должен содержать пробелы"),
  password: yup.string()
    .required("Пароль должен содержать не менее 6 символов")
    .min(6, "Пароль должен содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
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
    .matches(/^\S*$/, "Отчество не должно содержать пробелы"),
  role: yup.number()
    .required()
    .oneOf([1, 2]),
}).required();

export default function Register({ setSeverity, setMessage, setOpen }: PageProps) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm<RegData>({
    resolver: yupResolver(schema),
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: RegData) => {
    try {
      await registerUser(data);
      const user = await getCurrentUser();
      setUser(user);
      setSeverity("success");
      setMessage("Регисатрация и вход успешены!");
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setUser(null);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    }
    finally {
      setOpen(true);
    }
  };

  return (
    <Container direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate("/")}
            title="Вернуться на главную"
            style={{ border: 0, backgroundColor: 'transparent', paddingLeft: 0 }}
          >
            <KeyboardBackspaceIcon sx={{ fontSize: '2.15rem' }} />
          </IconButton>
          <Typography variant="h4" sx={{ width: '100%', fontSize: '2.15rem' }}>
            Регистрация
          </Typography>
        </FormControl>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FormControl>
            <FormLabel>Логин</FormLabel>
            <TextField
              {...register("login")}
              fullWidth
              placeholder="user"
              autoComplete="login"
              error={!!errors.login}
              helperText={errors.login?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Пароль</FormLabel>
            <TextField
              {...register("password")}
              fullWidth
              placeholder="••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      title={showPassword ? "Спрятать пароль" : "Отобразить пароль"}
                      style={{ border: 0, backgroundColor: 'transparent' }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Фамилия</FormLabel>
            <TextField
              {...register("lastName")}
              fullWidth
              placeholder="Иванов"
              autoComplete="family-name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Имя</FormLabel>
            <TextField
              {...register("firstName")}
              fullWidth
              placeholder="Иван"
              autoComplete="given-name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Отчество</FormLabel>
            <TextField
              {...register("middleName")}
              fullWidth
              placeholder="Иванович (необязательно)"
              autoComplete="additional-name"
              error={!!errors.middleName}
              helperText={errors.middleName?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ margin: 0 }}>Роль</FormLabel>
            <Controller
              name="role"
              control={control}
              defaultValue={1}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  <FormControlLabel value={1} control={<Radio />} label="Студент" />
                  <FormControlLabel value={2} control={<Radio />} label="Преподаватель" />
                </RadioGroup>
              )}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained">Зарегистрироваться</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login" sx={{ alignSelf: 'center' }}>
            Войти
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}