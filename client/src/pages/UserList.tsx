import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearIcon from '@mui/icons-material/Clear';

import Page from '../components/Page';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import UserCard from '../components/UserCard';
import ContentContainer from '../components/ContentContainer';
import { getAllUsers } from '../services/users';

interface User {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  role: number;
}

const cardStyle = {
  background: 'hsl(0, 0%, 99%)',
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px'
};

export default function UserList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('name') || '');

  const pageSize = 20;

  const name = searchParams.get('name') || '';
  const orderBy = (searchParams.get('orderBy') as 'Name' | 'Role') || 'Name';
  const sortDirection = (searchParams.get('sortDirection') === '1' ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers(name, orderBy, sortDirection, currentPage, pageSize);
        setUsers(data.data);
        setTotalCount(data.totalCount);
      } catch (e) {
        console.error(e);
      }
    };

    fetchUsers();
  }, [searchParams]);

  const updateSearchParams = (newParams: Record<string, string | number>) => {
    setSearchParams((prev) => {
      const updatedParams = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) updatedParams.set(key, value.toString());
        else updatedParams.delete(key);
      });
      return updatedParams;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateSearchParams({ name: '', page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery !== name) {
      updateSearchParams({ name: searchQuery, page: 1 });
      e.currentTarget.blur();
    }
  };

  const handleProfileClick = useCallback((id: number) => {
    console.log(`Просмотр профиля пользователя с ID: ${id}`);
  }, []);

  const handleRoleChange = useCallback((id: number) => {
    console.log(`Изменение роли пользователя с ID: ${id}`);
  }, []);

  return (
    <Page>
      <Header />
      <ContentContainer gap='1rem' sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
        <Stack gap='1rem'>
          <Stack flexDirection='row' justifyContent='space-between'>
            <Typography variant='h4'>Список пользователей</Typography>
            <FormControl sx={{ minWidth: '10rem' }} variant='outlined'>
              <OutlinedInput
                size='small'
                placeholder='Поиск…'
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                startAdornment={
                  <InputAdornment position='start'>
                    <SearchRoundedIcon fontSize='small' />
                  </InputAdornment>
                }
                endAdornment={(
                  <InputAdornment position="end" sx={{ margin: 0 }}>
                    <IconButton edge='end' onClick={handleClearSearch} style={{ border: 0, backgroundColor: 'transparent' }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )}
              />
            </FormControl>
          </Stack>
          {users.length === 0 || currentPage > Math.ceil(totalCount / pageSize) ? (
            <Card sx={{ ...cardStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='h5'>Пользователей не нашлось :(</Typography>
            </Card>
          ) : (
            <Stack gap='1rem'>
              <Card sx={{ ...cardStyle, padding: '0' }}>
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onProfileClick={() => handleProfileClick(user.id)}
                    onRoleChange={() => handleRoleChange(user.id)}
                  />
                ))}
              </Card>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
                onPageChange={(page) => updateSearchParams({ page })}
              />
            </Stack>
          )}
        </Stack>
        <Stack>
          <Card sx={{ ...cardStyle, position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
            <FormControl>
              <RadioGroup
                value={orderBy}
                onChange={(e) => updateSearchParams({ orderBy: e.target.value, page: currentPage })}
              >
                <FormControlLabel value='Name' control={<Radio />} label='По ФИО' />
                <FormControlLabel value='Role' control={<Radio />} label='По роли' />
              </RadioGroup>
            </FormControl>
            <Divider />
            <FormControl>
              <RadioGroup
                value={sortDirection}
                onChange={(e) => updateSearchParams({ sortDirection: Number(e.target.value), page: currentPage })}
              >
                <FormControlLabel value='0' control={<Radio />} label='По возрастанию' />
                <FormControlLabel value='1' control={<Radio />} label='По убыванию' />
              </RadioGroup>
            </FormControl>
          </Card>
        </Stack>
      </ContentContainer>
      <Footer />
    </Page>
  );
}