export interface PageResult<T> {
  data: T[];
  totalCount: number;
}

export interface PageProps {
  setSeverity: React.Dispatch<React.SetStateAction<'success' | 'error' | 'info' | 'warning'>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}