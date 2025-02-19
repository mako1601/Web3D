import { Container, Paper, Typography } from "@mui/material";
import ProfileForm from '../components/ProfileForm';

const ProfilePage = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Профиль пользователя
        </Typography>
        <ProfileForm />
      </Paper>
    </Container>
  );
};

export default ProfilePage;