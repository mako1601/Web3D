import * as React from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import TextField  from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import Card from './Card';
import SignUpContainer from './SignUpContainer';

export default function SignIn() {
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

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('* Пароль должен содержать не менее 6 символов');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!login.value || login.value.length < 1) {
      setLoginError(true);
      setLoginErrorMessage('* Обязательное поле');
      isValid = false;
    } else {
      setLoginError(false);
      setLoginErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (loginError || passwordError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      login: data.get('login'),
      password: data.get('password'),
    });
    event.preventDefault();
    return;
  };

  return (
    <SignUpContainer direction='column' justifyContent="space-between">
      <Card variant='outlined'>
        <Typography
          component='h1'
          variant='h4'
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Вход
        </Typography>
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
              color={loginError ? 'error' : 'primary'}
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
              color={passwordError ? 'error' : 'primary'}
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
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Сохранить вход"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >Войти</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
        У вас нет аккаунта?{' '}
          <Link
            href="/sign-up"
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >Зарегистрироваться</Link>
        </Typography>
      </Card>
    </SignUpContainer>
  );
}