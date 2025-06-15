import * as React from 'react';
import { useTestQuestions } from '@hooks/useTestQuestions';
import TestForm from '@components/TestForm';
import { getAllArticles } from '@api/articleApi';
import { Article } from '@mytypes/articleTypes';
import { useAuth } from '@context/AuthContext';

export default function CreateTest() {
  const [loading, setLoading] = React.useState(false);
  const localImages = React.useRef<Map<string, File>>(new Map());
    const { user } = useAuth();
    const [articles, setArticles] = React.useState<Article[] | null>(null);
    const [selectedArticleId, setSelectedArticleId] = React.useState<number | null>(null);

  const {
    title,
    handleTitleChange,
    description,
    handleDescriptionChange,
    questions,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    removeAnswerOption,
    setIsDirty,
    useCreateTest,
    isGridVisible,
    setIsGridVisible,
    questionErrors,
    handleQuestionChange,
    validateQuestion,
    setQuestionErrors,
    shouldValidate,
    formErrors
  } = useTestQuestions();

    React.useEffect(() => {
      const fetchArticles = async () => {
        try {
          const data = await getAllArticles({ userId: [user!.id], sortDirection: 1, orderBy: "UpdatedAt", pageSize: 50 });
          setArticles(data.data);
        } catch (e: any) {
          console.log(e);
        }
      };
      fetchArticles();
    }, []);

  const createTest = useCreateTest();
  const onSubmit = async () => {
    setLoading(true);
    await createTest(localImages, selectedArticleId);
    setLoading(false);
  };

  return (
    <TestForm
      mode="create"
      title={title}
      description={description}
      questions={questions}
      activeQuestionId={activeQuestionId}
      formErrors={formErrors}
      questionErrors={questionErrors}
      loading={loading}
      isGridVisible={isGridVisible}
      localImages={localImages}
      handleTitleChange={handleTitleChange}
      handleDescriptionChange={handleDescriptionChange}
      setActiveQuestionId={setActiveQuestionId}
      addQuestion={addQuestion}
      updateQuestion={updateQuestion}
      removeQuestion={removeQuestion}
      reorderQuestionsOnDrag={reorderQuestionsOnDrag}
      addAnswerOption={addAnswerOption}
      updateAnswerOption={updateAnswerOption}
      removeAnswerOption={removeAnswerOption}
      handleQuestionChange={handleQuestionChange}
      setIsDirty={setIsDirty}
      setIsGridVisible={setIsGridVisible}
      validateQuestion={validateQuestion}
      setQuestionErrors={setQuestionErrors}
      shouldValidate={shouldValidate}
      onSubmit={onSubmit}
      articles={articles}
      relatedArticleId={selectedArticleId}
      setRelatedArticleId={setSelectedArticleId}
    />
  );
}