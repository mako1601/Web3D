// import { useEffect } from "react";
// import { fetchUsers } from "./servieces/users";

// function App() {
//   useEffect(() => { 
//     const fetchData = async () => {
//       await fetchUsers();
//     } 

//     fetchData();
//   }, [])
  
//   return <></>;
// }

// export default App

import { Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AppTheme from './theme/AppTheme';
import ColorModeIconToggleButton from './theme/ColorModeIconToggleButton';

export default function App(props: { disableCustomTheme?: boolean }) {
  return(
    <AppTheme {...props}>
      <CssBaseline />
      <ColorModeIconToggleButton sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/sign-in' element={<SignIn />} />
      </Routes>
    </AppTheme>
  );
}