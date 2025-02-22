import { useMemo } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardActionArea from '@mui/material/CardActionArea';
import EditIcon from '@mui/icons-material/Edit';
import { UserDto } from '../api/userApi';

interface UserCardProps {
  user: UserDto;
  onProfileClick: () => void;
  onRoleChange: () => void;
}

const roleLabels: Record<number, string> = {
  0: 'Администратор',
  1: 'Студент',
  2: 'Преподаватель',
};

const styles = {
  cardArea: {
    padding: '1rem',
    marginRight: '-72px',
  },
  cardActions: {
    padding: '1rem',
  },
};

const UserCard = ({ user, onProfileClick, onRoleChange }: UserCardProps) => {
  const roleLabel = useMemo(() => roleLabels[user.role] || '', [user.role]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', borderRadius: '8px' }}>
      <CardActionArea sx={styles.cardArea} onClick={onProfileClick}>
        <Typography width="100%">
          {`${user.lastName} ${user.firstName} ${user.middleName}, ${roleLabel}`}
        </Typography>
      </CardActionArea>
      <CardActions sx={styles.cardActions}>
        <Tooltip title="Изменить роль">
          <IconButton onClick={onRoleChange}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </div>
  );
};

export default UserCard;