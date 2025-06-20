import React from 'react';

export type SnackbarContextType = {
  setSeverity: (severity: 'success' | 'error' | 'info' | 'warning') => void;
  setMessage: (message: string) => void;
  setOpen: (open: boolean) => void;
};

export const SnackbarContext = React.createContext<SnackbarContextType>({
  setSeverity: () => {},
  setMessage: () => {},
  setOpen: () => {},
});