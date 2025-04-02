import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Button } from '@mui/material';

import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import ContentContainer from '@components/ContentContainer';
import { startTest } from '@api/testApi';
import { PageProps } from '@mytypes/commonTypes';

export default function ViewTest({ setSeverity, setMessage, setOpen }: PageProps) {
  const { id } = ReactDOM.useParams();
  const testId = Number(id);

  React.useEffect(() => {
    if (isNaN(testId)) return;
  }, [testId]);

  const handleClick = async () => {
    try {
      const testResultId = await startTest(testId);
      window.location.href = `/tests/${testId}/results/${testResultId}`;
    } catch (e: any) {
      console.error(e);
      setOpen(true);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.statusText);
        console.log("e.response");
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else if (e.message) {
        setMessage(e.message);
        console.log("e.message");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    }
  }

  return (
    <Page>
      <Header />
      <ContentContainer>
        <Button onClick={(e) => { e.preventDefault(); handleClick(); }}>
          Пройти тестирование
        </Button>
      </ContentContainer>
      <Footer />
    </Page >
  );
}