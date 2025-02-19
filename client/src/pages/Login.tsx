import * as React from 'react';
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
import { loginUser } from '../api/authApi';
import { getCurrentUser } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  setSeverity: React.Dispatch<React.SetStateAction<'success' | 'error' | 'info' | 'warning'>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Login({ setSeverity, setMessage, setOpen }: LoginProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loginError, setLoginError] = React.useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    const password = document.getElementById('password') as HTMLInputElement;
    const login = document.getElementById('login') as HTMLInputElement;

    let isValid = true;
    const trimmedLogin = login.value.trim();

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('* Пароль должен содержать не менее 6 символов');
      isValid = false;
    } else if (/\s/.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage('* Пароль не должен содержать пробелы');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!trimmedLogin) {
      setLoginError(true);
      setLoginErrorMessage('* Обязательное поле');
      isValid = false;
    } else if (/\s/.test(trimmedLogin)) {
      setLoginError(true);
      setLoginErrorMessage('* Логин не должен содержать пробелы');
      isValid = false;
    } else {
      setLoginError(false);
      setLoginErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginError || passwordError) { return; }

    const data = new FormData(event.currentTarget);
    const login = data.get("login") as string;
    const password = data.get("password") as string;

    try {
      await loginUser(login, password);
      const user = await getCurrentUser();
      setUser(user);
      setSeverity("success");
      setMessage("Вход успешен!");
      setOpen(true);
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      setMessage(e.response.data);
      setOpen(true);
    }
  };

  return (
    <Container direction='column' justifyContent="space-between">
      <Card variant='outlined'>
        <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate("/")}
            style={{ border: 0, backgroundColor: 'transparent', paddingLeft: 0 }}
          >
            <KeyboardBackspaceIcon sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }} />
          </IconButton>
          <Typography
            component='h1'
            variant='h4'
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Вход
          </Typography>
        </FormControl>
        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor='login'>Логин</FormLabel>
            <TextField
              fullWidth
              name='login'
              placeholder='user'
              id='login'
              autoComplete='login'
              error={loginError}
              helperText={loginErrorMessage}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Пароль</FormLabel>
            <TextField
              fullWidth
              name="password"
              placeholder="••••••"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              variant="outlined"
              error={passwordError}
              helperText={passwordErrorMessage}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge='end'
                      style={{ border: 0, backgroundColor: 'transparent' }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Войти
          </Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас нет аккаунта?{' '}
          <Link
            component={RouterLink}
            to="/register"
            variant="body2"
            sx={{ alignSelf: 'center' }}
            onClick={(e) => { e.preventDefault(); navigate('/register');}}
          >
            Зарегистрироваться
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}