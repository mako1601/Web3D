import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { SnackbarCloseReason } from '@mui/material/Snackbar';
import { SnackbarContext, SnackbarContextType } from '@context/SnackbarContext';
import AppTheme from '@theme/AppTheme';
import ColorModeIconToggleButton from '@theme/ColorModeIconToggleButton';
import AppSnackbar from '@components/AppSnackbar';
import { AuthProvider } from '@context/AuthContext';

interface AppProps {
  children?: React.ReactNode;
  disableCustomTheme?: boolean;
}

export default function App({ children, disableCustomTheme }: AppProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPath(prev => window.location.pathname !== prev
        ? window.location.pathname
        : prev);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const snackbarContextValue: SnackbarContextType = {
    setSeverity,
    setMessage,
    setOpen,
  };

  return (
    <AuthProvider>
      <AppTheme {...{ disableCustomTheme }}>
        <CssBaseline />
        {currentPath !== '/model' && (
          <ColorModeIconToggleButton sx={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: '100' }} />
        )}
        <SnackbarContext.Provider value={snackbarContextValue}>
          <AppSnackbar open={open} message={message} severity={severity} onClose={handleClose} />
          {children}
        </SnackbarContext.Provider>
      </AppTheme>
    </AuthProvider>
  );
}