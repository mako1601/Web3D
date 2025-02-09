import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { gray } from '../theme/themePrimitives';

const Page = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
  gap: theme.spacing(2),
  backgroundColor: gray[50],
  ...theme.applyStyles('dark', {
    backgroundColor: gray[800],
  }),
}));

export default Page;