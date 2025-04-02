import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import Page from '@components/Page';
import Header from '@components/Header';
import ContentContainer from '@components/ContentContainer';
import PassTestQuestion from '@components/PassTestQuestion';
import { useAuth } from '@context/AuthContext';
import { Test, TestResult } from '@mytypes/testTypes';
import { finishTest, getTestForPassingById, getTestResultById } from '@api/testApi';
import { PageProps } from '@mytypes/commonTypes';

export default function PassTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const navigate = ReactDOM.useNavigate();
  const { testId, testResultId } = ReactDOM.useParams<{ testId: string; testResultId: string }>();
  const nTestId = Number(testId);
  const nTestResultId = Number(testResultId);
  const { user, loading: userLoading } = useAuth();

  const [test, setTest] = React.useState<Test | null>(null);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [openWarning, setOpenWarning] = React.useState(false);

  React.useEffect(() => {
    if (userLoading) return;
    if (!user || isNaN(nTestId) || isNaN(nTestResultId)) {
      navigate("/", { replace: true });
    }
  }, [user, userLoading, nTestId, nTestResultId, navigate]);

  const fetchTest = React.useCallback(async () => {
    setLoading(true);
    try {
      const testData = await getTestForPassingById(nTestId);
      const testResultData = await getTestResultById(nTestResultId);

      if (testData.id !== testResultData.testId
        || user?.id !== testResultData.userId
        || testResultData.endedAt !== null) {
        navigate("/", { replace: true });
        return;
      }

      setTest(testData);
      setTestResult(testResultData);
    } catch (e) {
      console.error("Ошибка загрузки теста:", e);
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [nTestId, nTestResultId, user, navigate]);

  React.useEffect(() => {
    if (user && !userLoading) {
      fetchTest();
    }
  }, [user, userLoading, fetchTest]);

  const handleFinishTest = async () => {
    if (!test || !testResult) return;

    try {
      setLoading(true);
      finishTest(testResult.id, { ...test, questions });
      navigate("/profile", { replace: true });
    } catch (e: any) {
      console.error(e);
      setOpen(true);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else if (e.message) {
        setMessage(e.message);
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!test || !testResult) return null;

  const questions = test.questions;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Page>
      <Header />
      <ContentContainer sx={{ justifyContent: 'space-between' }}>
        <PassTestQuestion
          question={currentQuestion}
          updateQuestion={updatedQuestion => {
            setTest(prevTest => {
              if (!prevTest) return prevTest;
              const updatedQuestions = prevTest.questions.map((q, index) =>
                index === currentQuestionIndex ? updatedQuestion : q
              );
              return { ...prevTest, questions: updatedQuestions };
            });
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', m: '3rem 0' }}>
          <Button disabled={currentQuestionIndex === 0} variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>Назад</Button>
          <Typography sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {currentQuestionIndex + 1}/{questions.length}
          </Typography>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Далее</Button>
          ) : (
            <Button variant="outlined" onClick={handleFinishTest}>Завершить тест</Button>
          )}
        </Box>
      </ContentContainer>
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)}>
        <DialogTitle>Внимание</DialogTitle>
        <DialogContent>
          Вы не выполнели все задания. Вы уверены, что хотите завершить тест досрочно?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenWarning(false); handleFinishTest(); }}>Да</Button>
          <Button onClick={() => setOpenWarning(false)}>Нет</Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        open={loading || userLoading || !test || !testResult}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page>
  );
}
