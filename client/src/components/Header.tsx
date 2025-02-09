import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { gray } from '../theme/themePrimitives';

const HeaderContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '56px',
  backgroundColor: 'hsl(0, 0%, 99%)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: gray[800],
    boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

interface HeaderProps {
  gridTemplateColumns: string;
}

const HeaderInner = styled(Box)<HeaderProps>(({ theme, gridTemplateColumns }) => ({
  margin: 'auto',
  padding: theme.spacing(0, 2),
  width: '100%',
  maxWidth: '1200px',
  height: '100%',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: gridTemplateColumns,
}));

export default function Header() {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <HeaderInner gridTemplateColumns='auto 1fr auto'>
        <Stack direction='row' spacing={2}>
          <Button
            variant='text'
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            Главная
          </Button>
        </Stack>
        <Stack direction='row' justifyContent='center' spacing={1}>
          <Button
            variant='text'
            onClick={(e) => {
              e.preventDefault();
              navigate("/users");
            }}
          >
            Пользователи
          </Button>
          <Button
            variant='text'
            onClick={(e) => {
              e.preventDefault();
              navigate("/articles");
            }}
          >
            Учебные материалы
          </Button>
          <Button
            variant='text'
            onClick={(e) => {
              e.preventDefault();
              navigate("/model");
            }}
          >
            3D
          </Button>
        </Stack>
        <Stack direction='row' justifyContent='flex-end' spacing={2}>
          <Button
            variant='contained'
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Войти
          </Button>
        </Stack>
      </HeaderInner>
    </HeaderContainer>
  );
}