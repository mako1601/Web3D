import { Link as RouterLink, useNavigate } from "react-router-dom";

import Link from '@mui/material/Link';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';

export default function Home() {
  const navigate = useNavigate();

  return(
    <FormControl>
      <FormLabel>Home page</FormLabel>
      <Link
        component={RouterLink}
        to="/login"
        variant="body2"
        onClick={(e) => {
          e.preventDefault();
          navigate('/login');
        }}
      >
        Войти
      </Link>
    </FormControl>
  );
}