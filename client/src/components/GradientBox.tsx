import { styled } from '@mui/material';
import { gray } from '@theme/themePrimitives';

const GradientBox = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 2,
  left: 0,
  width: '100%',
  height: '3rem',
  borderRadius: '8px',
  background: `linear-gradient(
    transparent 0%,
    ${theme.palette.background.default} 60%
  )`,
  ...theme.applyStyles('dark', {
    background: `linear-gradient(
      transparent 0%,
      ${gray[800]} 60%
    )`
  })
}));

export default GradientBox;