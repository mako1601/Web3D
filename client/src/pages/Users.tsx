// // import { useEffect, useState } from 'react';
// // import Container from '@mui/material/Container';
// // import {  getAllUsers } from '../servieces/users';
// // import { Button, TextField, Typography } from '@mui/material';

// // export default function Users() {
// //   //const [user, setUser] = useState(null);
// //   const [_users, setUsers] = useState(null);
// //   //const [id, setId] = useState<number | null>(null);

// //   // useEffect(() => {
// //   //   if (id !== null) {
// //   //     getUserById(id).then(data => {
// //   //       if (data) {
// //   //         setUser(data);
// //   //       }
// //   //     }).catch(e => {
// //   //       console.error(e);
// //   //     });
// //   //   }
// //   // }, [id]); // Зависимость от id

// //   // const func = () => {
// //   //   const data = document.getElementById('id') as HTMLInputElement;
// //   //   const userId = Number(data.value);
// //   //   setId(userId); // Обновляем состояние id
// //   // };

// //   useEffect(() => {
// //     getAllUsers().then(data => {
// //       if (data) {
// //         setUsers(data);
// //       }
// //     });
// //   }, []);

// //   return(
// //     <Container>
// //       <TextField id='id' name='id' variant='outlined'/>
// //       <Button
// //         // type="submit"
// //         variant='contained'
// //         //onClick={func}
// //       >
// //         Найти
// //       </Button>
// //       <Typography>
// //         {/* {users} */}
// //       </Typography>
// //     </Container>
// //   );
// // }

// import { useEffect, useState } from 'react';
// import Container from '@mui/material/Container';
// import Typography from '@mui/material/Typography';
// import { getAllUsers } from '../services/users'; // Убедитесь, что путь правильный
// import Header from '../components/Header';
// import Page from '../components/Page';
// import Content from '../components/ContentContainer';

// // Определяем интерфейс для пользователя на основе полученных данных
// interface User {
//   articles: any[]; // Массив статей (пока неизвестно, какая у них структура)
//   firstName: string; // Имя
//   id: number; // ID пользователя
//   lastActivity: string; // Последняя активность в формате ISO строки даты
//   lastName: string; // Фамилия
//   login: string; // Логин
//   middleName: string; // Отчество
//   passwordHash: string; // Хэш пароля (обычно это не показывается пользователю)
//   role: number; // Роль пользователя (число)
//   tests: any[]; // Массив тестов (пока неизвестно, какая у их структура)
// }

// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]); // Явно указываем тип состояния

//   useEffect(() => {
//     getAllUsers()
//       .then((data) => {
//         if (Array.isArray(data)) {
//           // Проверяем, что каждый элемент массива соответствует интерфейсу User
//           const validatedData = data.filter(
//             (item): item is User =>
//               typeof item.id === 'number' &&
//               typeof item.firstName === 'string' &&
//               typeof item.lastName === 'string' &&
//               typeof item.login === 'string'
//           );
//           setUsers(validatedData);
//         } else {
//           console.error('Полученные данные не являются массивом:', data);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка при получении пользователей:', error);
//       });
//   }, []);

//   if (!users || users.length === 0) {
//     return (
//       <Page>
//         <Header />
//         <Typography variant="body1">Загрузка пользователей...</Typography>
//       </Page>
//     );
//   }

//   return (
//     <Page>
//       <Header />
//       {/* <Content> */}
//         <ul>
//           {users.map((user) => (
//             <li key={user.id}>
//               {user.firstName} {user.middleName} {user.lastName} ({user.login})
//             </li>
//           ))}
//         </ul>
//       {/* </Content> */}
//     </Page>
//   );
// }