import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarCloseReason } from '@mui/material/Snackbar';

import AppTheme from '@theme/AppTheme';
import ColorModeIconToggleButton from '@theme/ColorModeIconToggleButton';
import AppRoutes from './routes';
import AppSnackbar from '@components/AppSnackbar';
import { AuthProvider } from '@context/AuthContext';

export default function App(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'success' | 'error' | 'info' | 'warning'>('success');

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <AuthProvider>
      <AppTheme {...props}>
        <CssBaseline />
        <ColorModeIconToggleButton sx={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: '100' }} />
        <AppSnackbar open={open} message={message} severity={severity} onClose={handleClose} />
        <AppRoutes setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />
      </AppTheme>
    </AuthProvider>
  );
}