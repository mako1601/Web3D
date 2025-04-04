import { useLocation } from "react-router-dom";
import { Box } from '@mui/material';

import Page from '@components/Page';
import Header from '@components/Header';
import ProfileNav from '@components/ProfileNav';
import ProfileForm from '@components/ProfileForm';
import ProfileTests from "@components/ProfileTests";
import ProfileResults from "@components/ProfileResults";
import ProfileArticles from "@components/ProfileArticles";
import ContentContainer from '@components/ContentContainer';
import ChangePasswordForm from '@components/ChangePasswordForm';
import { PageProps } from '@mytypes/commonTypes';

const Profile = ({ setSeverity, setMessage, setOpen }: PageProps) => {
  const location = useLocation();

  let content;
  if (location.pathname === "/profile/results") {
    content = (
      <ProfileResults />
    );
  } else if (location.pathname === "/profile/articles") {
    content = (
      <ProfileArticles />
    );
  } else if (location.pathname === "/profile/tests") {
    content = (
      <ProfileTests />
    );
  } else {
    content = (
      <>
        <ProfileForm setMessage={setMessage} setOpen={setOpen} setSeverity={setSeverity} />
        <ChangePasswordForm setMessage={setMessage} setOpen={setOpen} setSeverity={setSeverity} />
      </>
    );
  }

  return (
    <Page>
      <Header />
      <ContentContainer sx={{ flexDirection: "row" }} gap={2}>
        <ProfileNav />
        <Box display="flex" flexDirection="column" flex={4} gap={2}>
          {content}
        </Box>
      </ContentContainer>
    </Page>
  );
}

export default Profile;