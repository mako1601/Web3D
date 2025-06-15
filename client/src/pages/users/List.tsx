import * as React from 'react';
import { Box, Stack, Radio, Divider, Typography, RadioGroup, IconButton, FormControl, OutlinedInput, InputAdornment, FormControlLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import UserCard from '@components/UserCard';
import Pagination from '@components/Pagination';
import ContentContainer from '@components/ContentContainer';
import { changeRole, getAllUsers } from '@api/userApi';
import { ChangeUserRole, UserDto } from '@mytypes/userTypes';
import { roleLabels } from '@utils/roleLabels';
import { SnackbarContext } from '@context/SnackbarContext';
import { useSearchAndPagination } from '@hooks/useSearchAndPagination';

const PAGE_SIZE = 20;

export default function UserList() {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserDto | null>(null);

  const {
    fetchData,
    searchQuery,
    orderBy,
    sortDirection,
    data: users,
    totalCount,
    currentPage,
    handleSearchChange,
    handleClearSearch,
    handleKeyDown,
    handlePageChange,
    handleOrderByChange,
    handleSortDirectionChange,
  } = useSearchAndPagination(getAllUsers, PAGE_SIZE);

  const handleRoleChange = React.useCallback(async (user: UserDto | null) => {
    if (user) {
      if (user.role === 0) {
        setSeverity("error");
        setMessage("Нельзя изменить роль администратора");
        setOpen(true);
        return;
      }
      const newRole = user.role === 1 ? 2 : 1;
      try {
        const changeUserRole: ChangeUserRole = { userId: user.id, newRole: newRole };
        await changeRole(changeUserRole);
        fetchData();
      } catch (e: any) {
        console.error("Ошибка при изменении роли: ", e);
      }
    }
  }, [fetchData]);

  const handleDialogClickOpen = (user: UserDto) => { setSelectedUser(user); setOpenDialog(true); };
  const handleDialogClose = () => { setOpenDialog(false); };

  if (!users) {
    return (
      <Page>
        <Header />
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
      </Page>
    );
  }

  return (
    <Page>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Подтверждение изменения роли пользователя
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите изменить роль пользователя{" "}
            <em>
              {selectedUser && `${selectedUser.lastName} ${selectedUser.firstName}${selectedUser.middleName ? " " + selectedUser.middleName : ""}`}
            </em>{" "}
            на <strong>{roleLabels[selectedUser?.role === 1 ? 2 : 1]}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { handleDialogClose(); handleRoleChange(selectedUser); }}>Да</Button>
          <Button autoFocus onClick={handleDialogClose}>Нет</Button>
        </DialogActions>
      </Dialog>
      <Header />
      <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
        <Stack gap="1rem">
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography variant="h4">
              Список пользователей
            </Typography>
            <FormControl sx={{ minWidth: '10rem' }} variant="outlined">
              <OutlinedInput
                sx={{ maxHeight: '2rem' }}
                size="small"
                placeholder="Поиск…"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={(
                  <InputAdornment position="end" sx={{ margin: 0 }}>
                    <IconButton edge="end" onClick={handleClearSearch} style={{ border: 0, backgroundColor: 'transparent' }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )}
              />
            </FormControl>
          </Stack>
          {users.length === 0 || currentPage > Math.ceil(totalCount / PAGE_SIZE) ? (
            <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5">
                Пользователей не нашлось :(
              </Typography>
            </PageCard>
          ) : (
            <Stack gap="1rem">
              <PageCard sx={{ padding: '0' }}>
                {users.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRoleChange={() => handleDialogClickOpen(user)}
                  />
                ))}
              </PageCard>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / PAGE_SIZE)}
                onPageChange={handlePageChange}
              />
            </Stack>
          )}
        </Stack>
        <Stack>
          <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
            <FormControl>
              <RadioGroup
                value={orderBy}
                onChange={handleOrderByChange}
              >
                <FormControlLabel value="Name" control={<Radio />} label="По ФИО" />
                <FormControlLabel value="Role" control={<Radio />} label="По роли" />
              </RadioGroup>
            </FormControl>
            <Divider />
            <FormControl>
              <RadioGroup
                value={sortDirection}
                onChange={handleSortDirectionChange}
              >
                <FormControlLabel value="0" control={<Radio />} label="По возрастанию" />
                <FormControlLabel value="1" control={<Radio />} label="По убыванию" />
              </RadioGroup>
            </FormControl>
          </PageCard>
        </Stack>
      </ContentContainer>
    </Page>
  );
}