import { styled } from '@mui/material/styles';
import MuiCard from '@mui/material/Card';

const PageCard = styled(MuiCard)(({ theme }) => ({
  background: 'hsl(0, 0%, 99%)',
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    background: 'hsl(0, 0.00%, 14%)',
    boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default PageCard;