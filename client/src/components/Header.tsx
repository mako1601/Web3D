import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import HeaderMenu from './HeaderMenu';
import HeaderInner from './HeaderInner';
import HeaderContainer from './HeaderContainer';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <HeaderContainer>
      <HeaderInner gridTemplateColumns="auto 1fr auto">
        {/* left */}
        <Stack direction="row" spacing={2}>
          <Button variant="text" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            Главная
          </Button>
        </Stack>
        {/* middle */}
        <Stack direction="row" justifyContent="center" spacing={1}>
          <Button variant="text" onClick={(e) => { e.preventDefault(); navigate("/articles"); }}>
            Учебные материалы
          </Button>
          <Button variant="text" onClick={(e) => { e.preventDefault(); navigate("/model"); }}>
            3D
          </Button>
        </Stack>
        {/* right */}
        {user ? (
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="text" onClick={(e) => { e.preventDefault(); navigate("/articles/create"); }}>
              Создать учебный материалы
            </Button>
            <Avatar sx={{ bgcolor: 'primary.main', cursor: 'pointer' }} onClick={() => navigate("/profile")}>
              {user.lastName ? user.lastName[0].toUpperCase() : "?"}
            </Avatar>
            <HeaderMenu />
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="contained" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
              Войти
            </Button>
          </Stack>
        )}
      </HeaderInner>
    </HeaderContainer >
  );
}