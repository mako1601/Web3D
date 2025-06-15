import * as React from 'react';
import { Tooltip, IconButton, Typography, CardActions, CardActionArea } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { UserDto } from '@mytypes/userTypes';
import { roleLabels } from '@utils/roleLabels';

interface UserCardProps {
  user: UserDto;
  onRoleChange: () => void;
}

const styles = {
  cardArea: {
    cursor: 'auto',
    padding: '1rem',
    marginRight: '-72px',
  },
  cardActions: {
    padding: '1rem',
  },
};

const UserCard = ({ user, onRoleChange }: UserCardProps) => {
  const roleLabel = React.useMemo(() => roleLabels[user.role] || "", [user.role]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', borderRadius: '8px' }}>
      <CardActionArea sx={styles.cardArea}>
        <Typography width="100%">
          {`${user.lastName} ${user.firstName}${(user && typeof user.middleName === 'string' && user.middleName.trim() !== '') ? ' ' + user.middleName : ''}, ${roleLabel}`}
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