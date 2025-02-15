import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import UserList from './pages/UserList';
import Model from './pages/Model';
import AppTheme from './theme/AppTheme';
import ColorModeIconToggleButton from './theme/ColorModeIconToggleButton';

export default function App(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'success' | 'error' | 'info' | 'warning'>('success');

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline />
      <ColorModeIconToggleButton
        sx={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: '100'
        }}
      />
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            color: 'white',
            '& .MuiSvgIcon-fontSizeInherit': {
              color: 'white',
              height: '22px',
              width: '22px'
            },
            '& .MuiButtonBase-root': {
              width: '100%',
              height: '30px',
              margin: 0,
              padding: 0.625,
              color: 'white',
              border: 0,
              backgroundColor: 'transparent',
              ":hover": {
                borderRadius: '20px',
                background: 'rgba(var(--template-palette-action-activeChannel) / var(--template-palette-action-hoverOpacity))'
              }
            },
            '& .MuiSvgIcon-fontSizeSmall': {
              height: '20px',
              width: '20px'
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
      <Routes>
        <Route
          path='/'
          element={<Home />}
        />
        <Route
          path='/register'
          element={<Register setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />}
        />
        <Route
          path='/login'
          element={<Login setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />}
        />
        <Route path='/users' element={<UserList setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
        <Route path='/articles' element={<Model />} />
        <Route path='/model' element={<Model />} />
      </Routes>
    </AppTheme>
  );
}