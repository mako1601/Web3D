import * as React from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import TextField  from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import Card from './Card';
import SignUpContainer from './SignUpContainer';

export default function SignUp() {
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loginError, setLoginError] = React.useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = React.useState('');
  const [lastNameError, setLastNameError] = React.useState(false);
  const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');
  const [firstNameError, setFirstNameError] = React.useState(false);
  const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    const password = document.getElementById('password') as HTMLInputElement;
    const login = document.getElementById('login') as HTMLInputElement;
    const lastName = document.getElementById('lastName') as HTMLInputElement;
    const firstName = document.getElementById('firstName') as HTMLInputElement;
    // const middleName = document.getElementById('middleName') as HTMLInputElement;

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

    if (!lastName.value || lastName.value.length < 1) {
      setLastNameError(true);
      setLastNameErrorMessage('* Обязательное поле');
      isValid = false;
    } else {
      setLastNameError(false);
      setLastNameErrorMessage('');
    }

    if (!firstName.value || firstName.value.length < 1) {
      setFirstNameError(true);
      setFirstNameErrorMessage('* Обязательное поле');
      isValid = false;
    } else {
      setFirstNameError(false);
      setFirstNameErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (loginError || passwordError || firstNameError || lastNameError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      login: data.get('login'),
      password: data.get('password'),
      lastName: data.get('lastName'),
      firstName: data.get('firstName'),
      middleName: data.get('middleName'),
      role: data.get('role'),
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
          Регистрация
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
          <FormControl>
            <FormLabel htmlFor='lastName'>Фамилия</FormLabel>
            <TextField
              fullWidth
              name='lastName'
              placeholder='Иванов'
              id='lastName'
              autoComplete='family-name'
              error={lastNameError}
              helperText={lastNameErrorMessage}
              color={lastNameError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='firstName'>Имя</FormLabel>
            <TextField
              fullWidth
              name='firstName'
              placeholder='Иван'
              id='firstName'
              autoComplete='given-name'
              error={firstNameError}
              helperText={firstNameErrorMessage}
              color={firstNameError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='middleName'>Отчество</FormLabel>
            <TextField
              fullWidth
              name='middleName'
              placeholder='Иванович (необязательно)'
              id='middleName'
              autoComplete='additional-name'
              // error={middleNameError}
              // helperText={middleNameErrorMessage}
              // color={middleNameError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel id='role-radio-buttons-group' sx={{ margin: 0 }}>Роль</FormLabel>
            <RadioGroup
              row
              aria-labelledby='role-radio-buttons-group'
              name='role'
              defaultValue='1'
            >
              <FormControlLabel value='1' control={<Radio />} label='Студент' />
              <FormControlLabel value='2' control={<Radio />} label='Преподаватель' />
            </RadioGroup>
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
          >Зарегистрироваться</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас уже есть аккаунт?{' '}
          <Link
            href="/sign-in"
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >Войти</Link>
        </Typography>
      </Card>
    </SignUpContainer>
  );
}