// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
// import AddRoundedIcon from '@mui/icons-material/AddRounded';
// import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

// import Page from '../../components/Page';
// import Header from '../../components/Header';
// import Footer from '../../components/Footer';
// import PageCard from '../../components/PageCard';
// import ContentContainer from '../../components/ContentContainer';
// import { getTestById, updateTest } from '../../api/testApi';
// import { PageProps } from '../../App';
// import { useAuth } from '../../context/AuthContext';
// import { AnswerOptionDto, QuestionDto, Test, TestDto } from '../../types/testTypes';
// import { testSchema } from '../../schemas/testSchemas';

// export default function EditTest({ setSeverity, setMessage, setOpen }: PageProps) {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const testId = Number(id);

//   const { user, loading: userLoading } = useAuth();
//   const [test, setTest] = useState<Test | null>(null);
//   const [questions, setQuestions] = useState<QuestionDto[]>([]);
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset
//   } = useForm<TestDto>({
//     resolver: yupResolver(testSchema)
//   });

//   useEffect(() => {
//     if (userLoading) return;
//     if (!user) { navigate("/", { replace: true }); return; }
//     if (isNaN(testId)) { navigate("/", { replace: true }); return; }

//     const fetchArticle = async () => {

//       console.error("Индексы не обновляются!");

//       setLoading(true);
//       try {
//         const data = await getTestById(testId);
//         setTest(data);
//         if (Number(data.userId) !== Number(user.id)) {
//           navigate("/", { replace: true });
//           return;
//         }
//       } catch (error) {
//         console.error("Ошибка загрузки теста: ", error);
//         navigate("/", { replace: true });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticle();
//   }, [testId, user, userLoading]);

//   useEffect(() => {
//     if (test) {
//       setQuestions(test.questions);
//       reset({
//         title: test.title,
//         description: test.description,
//         questions: test.questions,
//       });
//     }
//   }, [test, reset]);

//   if (loading || userLoading) {
//     return (
//       <Page>
//         <Header />
//         <ContentContainer>
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//             <CircularProgress />
//           </Box>
//         </ContentContainer>
//         <Footer />
//       </Page>
//     );
//   }

//   if (!test) return null;

//   const addQuestion = () => {
//     if (questions.length < 50) {
//       const newQuestion: QuestionDto = {
//         index: questions.length,
//         text: "",
//         answerOptions: [
//           { index: 0, text: "", isCorrect: true },
//           { index: 1, text: "", isCorrect: false },
//         ]
//       };
//       setQuestions([...questions, newQuestion]);
//     }
//   };

//   const updateQuestion = (index: number, field: keyof QuestionDto, value: string) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
//     setQuestions(updatedQuestions);
//   };

//   const removeQuestion = (index: number) => {
//     if (questions.length > 1) {
//       setQuestions(questions.filter((_, i) => i !== index));
//     }
//     else {
//       setSeverity("error");
//       setMessage("Минимум 1 вопрос");
//       setOpen(true);
//     }
//   };

//   const addAnswerOption = (questionIndex: number) => {
//     const updatedQuestions = [...questions];
//     const question = updatedQuestions[questionIndex];
//     if (question.answerOptions.length < 4) {
//       question.answerOptions.push({
//         index: question.answerOptions.length,
//         text: "",
//         isCorrect: false
//       });
//       setQuestions(updatedQuestions);
//     }
//   };

//   const updateAnswerOption = (questionIndex: number, optionIndex: number, field: keyof AnswerOptionDto, value: string) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].answerOptions[optionIndex] = {
//       ...updatedQuestions[questionIndex].answerOptions[optionIndex],
//       [field]: value
//     };
//     setQuestions(updatedQuestions);
//   };

//   const setCorrectAnswer = (questionIndex: number, correctIndex: number) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].answerOptions = updatedQuestions[questionIndex].answerOptions.map((option, idx) => ({
//       ...option,
//       isCorrect: idx === correctIndex
//     }));
//     setQuestions(updatedQuestions);
//   };

//   const removeAnswerOption = (questionIndex: number, optionIndex: number) => {
//     const updatedQuestions = [...questions];
//     if (updatedQuestions[questionIndex].answerOptions.length > 2) {
//       updatedQuestions[questionIndex].answerOptions = updatedQuestions[questionIndex].answerOptions.filter((_, i) => i !== optionIndex);
//       setQuestions(updatedQuestions);
//     } else {
//       setSeverity("error");
//       setMessage("Минимум 2 варианта ответа");
//       setOpen(true);
//     }
//   };

//   const onSubmit = async (data: TestDto) => {
//     try {
//       setLoading(true);
//       await updateTest(test.id, { ...data, questions });
//       setSeverity("success");
//       setMessage("Тест успешно обновлён!");
//     } catch (e: any) {
//       console.error(e);
//       setSeverity("error");
//       if (e.response) {
//         setMessage(e.response.data);
//       } else if (e.request) {
//         setMessage("Сервер не отвечает, повторите попытку позже");
//       } else {
//         setMessage("Произошла неизвестная ошибка");
//       }
//     } finally {
//       setOpen(true);
//       setLoading(false);
//     }
//   }

//   return (
//     <Page>
//       <Header />
//       <ContentContainer gap="1rem">
//         <PageCard>
//           <Box
//             component="form"
//             onSubmit={handleSubmit(onSubmit)}
//             sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
//           >
//             <FormControl>
//               <FormLabel>Название</FormLabel>
//               <TextField
//                 {...register("title")}
//                 fullWidth
//                 error={!!errors.title}
//                 helperText={errors.title?.message}
//               />
//             </FormControl>
//             <FormControl>
//               <FormLabel>Описание</FormLabel>
//               <TextField
//                 {...register("description")}
//                 fullWidth
//                 multiline
//                 error={!!errors.description}
//                 helperText={errors.description?.message}
//               />
//             </FormControl>
//             <FormControl>
//               <FormLabel>Вопросы</FormLabel>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {questions.map((question, qIndex) => (
//                   <Box key={qIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                     <Box sx={{ display: 'flex', gap: 2 }}>
//                       <TextField
//                         {...register(`questions.${qIndex}.text`)}
//                         fullWidth
//                         value={question.text}
//                         onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
//                         placeholder={`Вопрос ${qIndex + 1}`}
//                         error={!!errors.questions?.[qIndex]?.text}
//                         helperText={errors.questions?.[qIndex]?.text?.message}
//                       />
//                       <IconButton onClick={() => removeQuestion(qIndex)} color="error">
//                         <ClearRoundedIcon />
//                       </IconButton>
//                     </Box>
//                     <RadioGroup
//                       sx={{ display: 'flex', gap: 2 }}
//                       value={question.answerOptions.findIndex((opt) => opt.isCorrect)}
//                       onChange={(e) => setCorrectAnswer(qIndex, parseInt(e.target.value))}
//                     >
//                       {question.answerOptions.map((option, aIndex) => (
//                         <Box key={aIndex} sx={{ display: 'flex', gap: 2 }}>
//                           <TextField
//                             {...register(`questions.${qIndex}.answerOptions.${aIndex}.text`)}
//                             fullWidth
//                             value={option.text}
//                             onChange={(e) => updateAnswerOption(qIndex, aIndex, "text", e.target.value)}
//                             placeholder={`Ответ ${aIndex + 1}`}
//                             error={!!errors.questions?.[qIndex]?.answerOptions?.[aIndex]?.text}
//                             helperText={errors.questions?.[qIndex]?.answerOptions?.[aIndex]?.text?.message}
//                           />
//                           <Box>
//                             <FormControlLabel
//                               sx={{ margin: 0 }}
//                               value={aIndex}
//                               control={<Radio />}
//                               label="Правильный"
//                             />
//                           </Box>
//                           <IconButton onClick={() => removeAnswerOption(qIndex, aIndex)} color="error">
//                             <ClearRoundedIcon />
//                           </IconButton>
//                         </Box>
//                       ))}
//                     </RadioGroup>
//                     <Button
//                       variant="outlined"
//                       startIcon={<AddRoundedIcon />}
//                       onClick={() => addAnswerOption(qIndex)}
//                       disabled={question.answerOptions.length >= 4}
//                       sx={{ display: question.answerOptions.length >= 4 ? "none" : "inline-flex" }}
//                     >
//                       Добавить вариант ответа
//                     </Button>
//                   </Box>
//                 ))}
//                 <Button
//                   variant="outlined"
//                   startIcon={<AddRoundedIcon />}
//                   onClick={addQuestion}
//                   disabled={questions.length >= 50}
//                   sx={{ display: questions.length >= 50 ? "none" : "inline-flex" }}
//                 >
//                   Добавить вопрос
//                 </Button>
//               </Box>
//             </FormControl>
//             <Button
//               type="submit"
//               fullWidth
//               variant={loading ? "outlined" : "contained"}
//               disabled={loading}
//             >
//               {loading ? "Сохранение…" : "Сохранить"}
//             </Button>
//           </Box>
//         </PageCard>
//       </ContentContainer>
//       <Footer />
//     </Page>
//   );
// }