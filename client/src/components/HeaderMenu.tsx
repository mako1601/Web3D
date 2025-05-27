import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Divider, MenuItem, Avatar, Box } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { logoutUser } from '@api/authApi';
import { useAuth } from '@context/AuthContext';
import StyledIconButton from './StyledIconButton';
import { roleLabels } from '@utils/roleLabels';

const HeaderMenu = () => {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    handleClose();
  };

  if (!user) return null;

  const roleLabel = React.useMemo(() => roleLabels[user.role] || "", [user.role]);

  return (
    <Box display="flex" alignItems="center">
      <StyledIconButton
        disabled={
          location.pathname === "/articles/create" ||
          /^\/articles\/[^/]+\/edit$/.test(location.pathname) ||
          location.pathname === "/tests/create" ||
          /^\/tests\/[^/]+\/edit$/.test(location.pathname) ||
          /^\/tests\/[^/]+\/results\/[^/]+$/.test(location.pathname)
        }
        onClick={handleClick}>
        <MenuRoundedIcon />
      </StyledIconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem component={Link} to="/profile/data" onClick={handleClose}>
          <Box display="flex" flexDirection="row" gap={1} sx={{ alignItems: 'center', whiteSpace: 'normal' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user.lastName ? user.lastName[0].toUpperCase() : "?"}
            </Avatar>
            <Box sx={{ width: '120px', maxWidth: '200px', overflowWrap: 'break-word' }}>
              <Box>
                {user.lastName} {user.firstName}
                {(user && typeof user.middleName === 'string' && user.middleName.trim() !== '') ? ' ' + user.middleName : ''}
              </Box>
              <Box style={{ fontSize: '0.8rem', color: 'text.secondary' }}>{roleLabel}</Box>
            </Box>
          </Box>
        </MenuItem>
        {/* <MenuItem component={Link} to="/profile/data" onClick={handleClose}>Профиль</MenuItem> */}
        {user.role === 0 && (
          <MenuItem component={Link} to="/users" onClick={handleClose}>Пользователи</MenuItem>
        )}
        {user.role === 1 && (
          <MenuItem component={Link} to="/profile/results" onClick={handleClose}>Мои результаты</MenuItem>
        )}
        {user.role === 2 && (
          <>
            <MenuItem component={Link} to="/profile/articles" onClick={handleClose}>Мои учебные материалы</MenuItem>
            <MenuItem component={Link} to="/profile/tests" onClick={handleClose}>Мои тесты</MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>Выйти</MenuItem>
      </Menu>
    </Box>
  );
};

export default HeaderMenu;