import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import QuizIcon from '@mui/icons-material/Quiz';
import ArticleIcon from '@mui/icons-material/Article';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CreateMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="outlined"
        sx={{ color: 'text.secondary' }}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Создать
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem sx={{ color: 'text.secondary', gap: 1 }} onClick={() => { navigate("/articles/create"); handleClose(); }}><ArticleIcon />Учебный материал</MenuItem>
        <MenuItem sx={{ color: 'text.secondary', gap: 1 }} onClick={() => { navigate("/tests/create"); handleClose(); }}><QuizIcon />Тест</MenuItem>
      </Menu>
    </div >
  );
}

export default CreateMenu;