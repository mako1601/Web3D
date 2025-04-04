import * as React from 'react';
import * as ReactDOM from 'react-router-dom';

export const useSearchAndPagination = (
  fetchData: ({
    searchText,
    userId,
    orderBy,
    sortDirection,
    currentPage,
    pageSize
  }: {
    searchText?: string,
    userId?: number,
    orderBy?: string,
    sortDirection?: number,
    currentPage?: number,
    pageSize?: number
  }) => Promise<any>, pageSize: number
) => {
  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("searchText") || "");
  const searchText = searchParams.get("searchText") || "";
  const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId") || "", 10) : undefined;
  const orderBy = (searchParams.get("orderBy") as "Title" | "UserId" | "CreatedAt" | "UpdatedAt") || "Title";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = React.useState<any[] | null>(null);
  const [totalCount, setTotalCount] = React.useState(0);

  const fetchArticles = React.useCallback(async () => {
    try {
      const response = await fetchData({ searchText, userId, orderBy, sortDirection, currentPage, pageSize });
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (e) {
      setData(null);
      setTotalCount(0);
    }
  }, [fetchData, userId, searchText, orderBy, sortDirection, currentPage, pageSize]);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const updateSearchParams = (newParams: Record<string, string | number>) => {
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

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ orderBy: e.target.value, page: 1 });
  };

  const handleSortDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ sortDirection: Number(e.target.value), page: 1 });
  };

  return {
    searchQuery,
    orderBy,
    sortDirection,
    data,
    totalCount,
    currentPage,
    handleSearchChange,
    handleClearSearch,
    handleKeyDown,
    handlePageChange,
    handleOrderByChange,
    handleSortDirectionChange,
  };
};