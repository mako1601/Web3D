import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, Stack, Radio, Divider, Typography, RadioGroup, IconButton, FormControl, OutlinedInput, InputAdornment, FormControlLabel, CircularProgress } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import UserCard from '@components/UserCard';
import Pagination from '@components/Pagination';
import ContentContainer from '@components/ContentContainer';
import { changeRole, getAllUsers } from '@api/userApi';
import { UserDto } from '../../types/userTypes';
import { PageProps } from '../../types/commonTypes';

const PAGE_SIZE = 20;

export default function UserList({ setSeverity, setMessage, setOpen }: PageProps) {
  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('name') || '');

  const name = searchParams.get("name") || "";
  const orderBy = (searchParams.get("orderBy") as "Name" | "Role") || "Name";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [totalCount, setTotalCount] = React.useState(0);
  const [users, setUsers] = React.useState<UserDto[] | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      const data = await getAllUsers(name, orderBy, sortDirection, currentPage, PAGE_SIZE);
      setUsers(data.data);
      setTotalCount(data.totalCount);
    } catch (e: any) {
      setUsers([]);
      setTotalCount(0);
    }
  }, [name, orderBy, sortDirection, currentPage, PAGE_SIZE]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateSearchParams = (newParams: Record<string, string | number>) => {
    window.scrollTo(0, 0);
    setSearchParams((prev) => {
      const updatedParams = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          updatedParams.set(key, value.toString());
        } else {
          updatedParams.delete(key);
        }
      });
      return updatedParams;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateSearchParams({ name: "", page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery !== name) {
      updateSearchParams({ name: searchQuery, page: 1 });
      e.currentTarget.blur();
    }
  };

  const handleProfileClick = React.useCallback((id: number) => {
    console.log(`Просмотр профиля пользователя с ID: ${id}`);
  }, []);

  const handleRoleChange = React.useCallback(async (id: number, role: number) => {
    if (role === 0) {
      setSeverity("error");
      setMessage("Нельзя изменить роль администратора");
      setOpen(true);
      return;
    }
    const newRole = role === 1 ? 2 : 1;
    try {
      await changeRole(id, newRole);
      await fetchUsers();
    } catch (e: any) {
      console.error("Ошибка при изменении роли:", e);
    }
  }, [fetchUsers]);

  if (!users) {
    return (
      <Page>
        <Header />
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
        <Footer />
      </Page>
    );
  }

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
        <Stack gap="1rem">
          <Stack flexDirection="row" justifyContent='space-between'>
            <Typography variant="h4">
              Список пользователей
            </Typography>
            <FormControl sx={{ minWidth: '10rem' }} variant='outlined'>
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
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onProfileClick={() => handleProfileClick(user.id)}
                    onRoleChange={() => handleRoleChange(user.id, user.role)}
                  />
                ))}
              </PageCard>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / PAGE_SIZE)}
                onPageChange={(page) => updateSearchParams({ page })}
              />
            </Stack>
          )}
        </Stack>
        <Stack>
          <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
            <FormControl>
              <RadioGroup
                value={orderBy}
                onChange={(e) => updateSearchParams({ orderBy: e.target.value, page: currentPage })}
              >
                <FormControlLabel value="Name" control={<Radio />} label="По ФИО" />
                <FormControlLabel value="Role" control={<Radio />} label="По роли" />
              </RadioGroup>
            </FormControl>
            <Divider />
            <FormControl>
              <RadioGroup
                value={sortDirection}
                onChange={(e) => updateSearchParams({ sortDirection: Number(e.target.value), page: currentPage })}
              >
                <FormControlLabel value="0" control={<Radio />} label="По возрастанию" />
                <FormControlLabel value="1" control={<Radio />} label="По убыванию" />
              </RadioGroup>
            </FormControl>
          </PageCard>
        </Stack>
      </ContentContainer>
      <Footer />
    </Page>
  );
}