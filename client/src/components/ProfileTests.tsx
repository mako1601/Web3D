import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Typography, Link, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';

import PageCard from './PageCard';
import { useAuth } from '@context/AuthContext';
import { PageResult } from '@mytypes/commonTypes';
import { formatDate } from '@utils/dateUtils';
import StyledIconButton from './StyledIconButton';
import { gray } from '@theme/themePrimitives';
import { getAllTestResults, getAllTests } from '@api/testApi';
import { Test, TestResult } from '@mytypes/testTypes';

const ProfileTests = () => {
  const { user } = useAuth();
  const [tests, setTests] = React.useState<PageResult<Test> | null>(null);
  const [testResults, setTestResults] = React.useState<PageResult<TestResult> | null>(null);

  const fetchTests = async () => {
    try {
      const testData = await getAllTests({ userId: user!.id, orderBy: "CreatedAt", currentPage: 1, pageSize: 7, sortDirection: 1 });
      const testResultData = await getAllTestResults({});
      setTests(testData);
      setTestResults(testResultData);
    } catch (e: any) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    if (user !== null)
      fetchTests();
  }, [user]);

  const getAttemptsCount = (testId: number) => {
    return testResults?.data.filter(r => r.testId === testId && r.endedAt).length ?? 0;
  };

  const getUnfinishedAttemptsCount = (testId: number) => {
    return testResults?.data.filter(r => r.testId === testId && !r.endedAt).length ?? 0;
  };

  const getAverageScore = (testId: number) => {
    const results = testResults?.data.filter(r => r.testId === testId && r.endedAt);
    if (!results || results.length === 0) return '—';
    const totalCorrect = results.reduce((sum, r) => sum + (r.score ?? 0), 0);
    const totalQuestions = results.reduce((sum, r) => sum + r.answerResults.length, 0);
    if (totalQuestions === 0) return '—';
    const avg = (totalCorrect / totalQuestions) * 100;
    return `${avg.toFixed(2).replace('.', ',')}%`;
  };

  return (
    <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: tests ? 'auto' : '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Недавно загруженные тесты</Typography>
        <Link component={RouterLink} to={`/tests?userId=${user?.id}`}>Показать все</Link>
      </Box>
      {tests ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {tests.data.map(test => (
            <Box
              key={test.id}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                border: `1px solid ${gray[200]}`,
                borderRadius: 1,
                padding: 2,
              }}
            >
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">
                    <RouterLink to={`/tests/${test.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                      {test.title}
                    </RouterLink>
                  </Typography>
                  <Typography>{formatDate(test.createdAt)}</Typography>
                </Box>
                <Box display="flex" flexDirection="row" gap={6}>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ minWidth: 100 }}
                  >
                    <Tooltip title="Пройдено тестов">
                      <TaskAltRoundedIcon fontSize="small" />
                    </Tooltip>
                    <Typography fontSize="1rem" variant="h6">{getAttemptsCount(test.id)}</Typography>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ minWidth: 100 }}
                  >
                    <Tooltip title="Тестов в процессе">
                      <PendingActionsRoundedIcon fontSize="small" />
                    </Tooltip>
                    <Typography fontSize="1rem" variant="h6">{getUnfinishedAttemptsCount(test.id)}</Typography>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ minWidth: 100 }}
                  >
                    <Tooltip title="Успеваемость">
                      <GradeRoundedIcon fontSize="small" />
                    </Tooltip>
                    <Typography fontSize="1rem" variant="h6">{getAverageScore(test.id)}</Typography>
                  </Box>
                </Box>
              </Box>
              <RouterLink
                title="Изменить"
                to={`/tests/${test.id}/edit`}
                style={{ textDecoration: 'none', color: 'black', borderRadius: '50%' }}
              >
                <StyledIconButton sx={{ borderRadius: '50%', color: 'black' }}>
                  <EditIcon />
                </StyledIconButton>
              </RouterLink>
            </Box>
          ))}
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
    </PageCard >
  );
}

export default ProfileTests;