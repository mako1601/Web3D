import * as ReactDOM from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import { useAuth } from "@context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const allowedRolesSet = new Set(allowedRoles);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !allowedRolesSet.has(user.role)) {
    return <ReactDOM.Navigate to="/" replace />;
  }

  return <ReactDOM.Outlet />;
};

export default ProtectedRoute;