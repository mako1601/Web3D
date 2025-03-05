import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Menu, Divider, MenuItem, IconButton } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { logoutUser } from '@api/authApi';
import { useAuth } from "@context/AuthContext";

const HeaderMenu = () => {
  const navigate = ReactDOM.useNavigate();
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
    navigate("/");
  };

  return (
    <div>
      <IconButton onClick={handleClick}>
        <MenuRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => { navigate("/profile"); handleClose(); }}>Профиль</MenuItem>
        {user?.role === 0 && (
          <MenuItem onClick={() => { navigate("/users"); handleClose(); }}>Пользователи</MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { handleLogout(); }}>Выйти</MenuItem>
      </Menu>
    </div>
  );
}

export default HeaderMenu;