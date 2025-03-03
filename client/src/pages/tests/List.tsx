import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, CircularProgress, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, OutlinedInput, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import PageCard from '@components/PageCard';
import TestCard from '@components/TestCard';
import Pagination from '@components/Pagination';
import ContentContainer from '@components/ContentContainer';
import { getAllTests } from '@api/testApi';
import { Test } from '../../types/testTypes';

const PAGE_SIZE = 10;

export default function TestList() {
  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("searchText") || "");


  const searchText = searchParams.get("searchText") || "";
  const orderBy = (searchParams.get("orderBy") as "Title" | "UserId" | "CreatedAt" | "UpdatedAt") || "Title";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [tests, setTests] = React.useState<Test[] | null>(null);
  const [totalCount, setTotalCount] = React.useState(0);

  const fetchArticles = React.useCallback(async () => {
    try {
      const data = await getAllTests(searchText, orderBy, sortDirection, currentPage, PAGE_SIZE);
      setTests(data.data);
      setTotalCount(data.totalCount);
    } catch (e: any) {
      setTests(null);
      setTotalCount(0);
    }
  }, [searchText, orderBy, sortDirection, currentPage, PAGE_SIZE]);

  React.useEffect(() => {
    fetchArticles();
    console.error("Оптимизировать запросы!");
  }, [fetchArticles]);

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
    updateSearchParams({ searchText: "", page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery !== searchText) {
      updateSearchParams({ searchText: searchQuery, page: 1 });
      e.currentTarget.blur();
    }
  };

  if (!tests) {
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
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography variant="h4">
              Список тестов
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
          {tests.length === 0 || currentPage > Math.ceil(totalCount / PAGE_SIZE) ? (
            <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5">
                Тесты не нашлись :(
              </Typography>
            </PageCard>
          ) : (
            <Stack gap="1rem">
              <PageCard sx={{ padding: 0 }}>
                {tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onClick={() => console.log(test.id)}
                  // onClick={() => navigate(`${test.id}`)}
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
                <FormControlLabel value="Title" control={<Radio />} label="По названию" />
                <FormControlLabel value="UserId" control={<Radio />} label="По автору" />
                <FormControlLabel value="CreatedAt" control={<Radio />} label="По дате создания" />
                <FormControlLabel value="UpdatedAt" control={<Radio />} label="По дате обновления" />
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