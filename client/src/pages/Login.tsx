import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Card from '../components/Card';
import Container from '../components/Container';
import { LogData, loginUser } from '../api/authApi';
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
}).required();

export default function Login({ setSeverity, setMessage, setOpen }: PageProps) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LogData>({
    resolver: yupResolver(schema),
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LogData) => {
    try {
      await loginUser(data);
      const user = await getCurrentUser();
      setUser(user);
      setSeverity("success");
      setMessage("Вход успешен!");
      setOpen(true);
      navigate("/");
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        setSeverity("error");
        setMessage(e.response.data);
      } else if (e.request) {
        setSeverity("error");
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setSeverity("error");
        setMessage("Произошла неизвестная ошибка");
      }
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
            Вход
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
          <Button type="submit" fullWidth variant="contained">Войти</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас нет аккаунта?{' '}
          <Link component={RouterLink} to="/register" sx={{ alignSelf: 'center' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}