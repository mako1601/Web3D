import * as ReactDOM from "react-router-dom";

import { useAuth } from "@context/AuthContext";

const PublicRoute = () => {
  const { user } = useAuth();
  return user ? <ReactDOM.Navigate to="/" replace /> : <ReactDOM.Outlet />;
};

export default PublicRoute;