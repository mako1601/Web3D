import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '../../components/Page';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageCard from '../../components/PageCard';
import Pagination from '../../components/Pagination';
import ArticleCard from '../../components/ArticleCard';
import ContentContainer from '../../components/ContentContainer';
import { ArticleDto, getAllArticles } from '../../api/articleApi';

export default function ArticleList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("searchText") || "");

  const pageSize = 10;

  const searchText = searchParams.get("searchText") || "";
  const orderBy = (searchParams.get("orderBy") as "Title" | "UserId" | "CreatedAt" | "UpdatedAt") || "Title";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [totalCount, setTotalCount] = useState(0);
  const [articles, setArticles] = useState<ArticleDto[]>([]);

  const fetchArticles = useCallback(async () => {
    try {
      const data = await getAllArticles(searchText, orderBy, sortDirection, currentPage, pageSize);
      setArticles(data.data);
      setTotalCount(data.totalCount);
    } catch (e: any) {
      setArticles([]);
      setTotalCount(0);
    }
  }, [searchText, orderBy, sortDirection, currentPage, pageSize]);

  useEffect(() => {
    fetchArticles();
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
      updatedParams.set("page", "1");
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

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
        <Stack gap="1rem">
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography variant="h4">
              Список учебных материалов
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
          {articles.length === 0 || currentPage > Math.ceil(totalCount / pageSize) ? (
            <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5">
                Учебные материалы не нашлись :(
              </Typography>
            </PageCard>
          ) : (
            <Stack gap="1rem">
              <PageCard sx={{ padding: 0 }}>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => navigate(`${article.id}`)}
                  />
                ))}
              </PageCard>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
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