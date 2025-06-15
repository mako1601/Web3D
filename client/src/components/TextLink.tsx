import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { styled } from '@mui/material/styles';

type TextLinkProps = {
  bold?: boolean;
  to?: RouterLinkProps['to'];
  href?: string;
} & Omit<MuiLinkProps, 'href' | 'to'>;

const StyledLink = styled(MuiLink)<{ bold?: boolean }>(({ theme, bold }) => ({
  fontWeight: bold ? 'bold' : 'normal',
  color: theme.palette.primary.main,
  transition: 'color 0.3s ease',
  textDecoration: 'none',
  '&::before': {
    display: 'none',
  },
  '&:hover': {
    color: `${theme.palette.primary.dark} !important`,
    textDecoration: 'none',
    '&::before': {
      display: 'none',
    },
  },
  '&:visited': {
    color: theme.palette.primary.main,
  },
  '&:active': {
    color: `${theme.palette.primary.dark} !important`,
  },
}));

export function TextLink({ bold = true, to, href, ...props }: TextLinkProps) {
  const linkProps = to
    ? { component: RouterLink, to }
    : { href };

  return (
    <StyledLink
      bold={bold}
      {...linkProps}
      {...props}
    />
  );
}