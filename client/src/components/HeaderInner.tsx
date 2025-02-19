import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

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

export default HeaderInner;