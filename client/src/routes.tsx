import { Route, Routes } from 'react-router-dom';

import Home from '@pages/Home';
import Login from '@pages/users/Login';
import Profile from '@pages/users/Profile';
import Register from '@pages/users/Register';
import UserList from '@pages/users/UserList';
import EditTest from '@pages/tests/Edit';
import TestList from '@pages/tests/List';
import ViewTest from '@pages/tests/View';
import PassTest from '@pages/tests/Pass';
import CreateTest from '@pages/tests/Create';
import ViewArticle from '@pages/articles/View';
import ArticleList from '@pages/articles/List';
import EditArticle from '@pages/articles/Edit';
import CreateArticle from '@pages/articles/Create';
import ModelView from '@pages/model/View';
import PublicRoute from '@components/PublicRoute';
import ProtectedRoute from '@components/ProtectedRoute';
import { PageProps } from '@mytypes/commonTypes';

const AppRoutes: React.FC<PageProps> = ({ setSeverity, setMessage, setOpen }) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PublicRoute />}>
        <Route path="/register" element={<Register setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
        <Route path="/login" element={<Login setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[0, 1, 2]} />}>
        <Route path="/profile" element={<Profile setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[0]} />}> {/*Only for Admin*/}
        <Route path="/users" element={<UserList setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route path="/articles" element={<ArticleList />} />
      <Route path="/articles/:id" element={<ViewArticle />} />
      <Route element={<ProtectedRoute allowedRoles={[2]} />} > {/*Only for Teacher*/}
        <Route path="/articles/create" element={<CreateArticle setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
        <Route path="/articles/:id/edit" element={<EditArticle setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route path="/tests" element={<TestList />} />
      <Route path="/tests/:id" element={<ViewTest setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      <Route element={<ProtectedRoute allowedRoles={[1]} />} > {/*Only for Student*/}
        <Route path="/tests/:testId/results/:testResultId" element={<PassTest setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen}/>} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[2]} />} > {/*Only for Teacher*/}
        <Route path="/tests/create" element={<CreateTest setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
        <Route path="/tests/:id/edit" element={<EditTest setSeverity={setSeverity} setMessage={setMessage} setOpen={setOpen} />} />
      </Route>
      <Route path="/model" element={<ModelView />} />
    </Routes>
  );
};

export default AppRoutes;