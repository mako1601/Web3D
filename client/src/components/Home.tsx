import Link from '@mui/material/Link';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';

export default function Home() {
    return(
      <FormControl>
        <FormLabel>Home page</FormLabel>
        <Link
          href="/sign-in"
          variant="body2"
        >Войти</Link>
      </FormControl>
    );
}