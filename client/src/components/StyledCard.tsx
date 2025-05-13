import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { gray } from '@theme/themePrimitives';

const StyledCard = styled(Link)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '8px',
  color: 'inherit',
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: gray[100],
  },
  ...theme.applyStyles?.('dark', {
    backgroundColor: gray[800],
    '&:hover': {
      backgroundColor: gray[900],
    }
  })
}));

export default StyledCard;