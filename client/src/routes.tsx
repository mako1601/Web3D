import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Model from './pages/Model';
import Profile from './pages/Profile';
import Register from './pages/Register';
import UserList from './pages/UserList';
import TiptapEditor from './pages/ArticleEditor';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { PageProps } from './App';

const AppRoutes: React.FC<PageProps> = ({ setSeverity, setMessage, setOpen }) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PublicRoute />}>
        <Route path="/register" element={<Register setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
        <Route path="/login" element={<Login setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/users" element={<UserList setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route path="/articles" element={<TiptapEditor />} />
      <Route path="/model" element={<Model />} />
      <Route path="/profile" element={<Profile setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
    </Routes>
  );
};

export default AppRoutes;