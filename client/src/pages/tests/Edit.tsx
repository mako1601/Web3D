import * as React from 'react';
import * as ReactDOM from 'react-router-dom';

import { getTestById } from '@api/testApi';
import TestForm from '@components/TestForm';
import { useAuth } from '@context/AuthContext';
import { QuestionMap, Test } from '@mytypes/testTypes';
import { useTestQuestions } from '@hooks/useTestQuestions';

export default function EditTest() {
  const navigate = ReactDOM.useNavigate();
  const { id } = ReactDOM.useParams();
  const testId = Number(id);
  const { user, loading: userLoading } = useAuth();
  const [test, setTest] = React.useState<Test | null>(null);
  const [loading, setLoading] = React.useState(false);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());

  const {
    title,
    setTitle,
    handleTitleChange,
    description,
    setDescription,
    handleDescriptionChange,
    questions,
    handleQuestionChange,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    setQuestions,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    removeAnswerOption,
    setIsDirty,
    useEditTest,
    useDeleteTest,
    isGridVisible,
    setIsGridVisible,
    formErrors,
    questionErrors,
    setQuestionErrors,
    shouldValidate,
    validateQuestion,
  } = useTestQuestions();

  React.useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (isNaN(testId)) { navigate("/", { replace: true }); return; }

    const fetchTest = async () => {
      setLoading(true);
      try {
        const data = await getTestById(testId);
        if (Number(data.userId) !== Number(user.id)) {
          navigate("/", { replace: true });
          return;
        }
        setTest(data);
        setTitle(data.title);
        setDescription(data.description ?? '');
        const sortedQuestions = data.questions.sort((a, b) => a.index - b.index);

        const questionMap: QuestionMap = {};
        for (const question of sortedQuestions) {
          let task;
          try {
            task = JSON.parse(question.taskJson);
          } catch (e) {
            console.warn(`Не удалось распарсить JSON для вопроса ${question.id}`, e);
            continue;
          }

          const q = {
            id: question.id,
            testId: question.testId,
            index: question.index,
            type: question.type,
            text: question.text,
            imageUrl: question.imageUrl,
            task
          };

          questionMap[crypto.randomUUID()] = q;
        }

        setQuestions(questionMap);
        setActiveQuestionId(Object.keys(questionMap)[0]);
      } catch (error) {
        console.error("Ошибка загрузки теста: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, user, userLoading]);

  React.useEffect(() => {
    if (test) {
      const imageUrls = Object.values(questions)
        .map(question => question.imageUrl)
        .filter((url): url is string => url !== undefined);
      initialImageUrls.current = imageUrls;
    }
  }, [test]);

  const editTest = useEditTest();
  const deleteTest = useDeleteTest();

  const onSubmit = async () => {
    setLoading(true);
    await editTest(test!.id, localImages, initialImageUrls);
    setLoading(false);
  };

  const onDelete = async () => {
    setLoading(true);
    await deleteTest(test!.id);
    setLoading(false);
  };

  return (
    <TestForm
      mode="edit"
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
      onDelete={onDelete}
    />
  );
}