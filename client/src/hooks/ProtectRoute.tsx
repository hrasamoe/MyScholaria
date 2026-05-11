import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuth, isLoading, user } = useAuth();

  console.log("ProtectedRoute:", { isAuth, isLoading, user }); // ← ajoute

  if (isLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );

  if (!isAuth) return <Navigate to="/auth/signin" replace />;

  return children ? <>{children}</> : <Outlet />;
}
interface RoleRouteProps {
  roles: string[];
  children?: ReactNode;
}

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user, isAuth, isLoading } = useAuth();

  if (isLoading) return null;

  // Utilisation de l'optional chaining (?.) et repli sur un tableau vide ([])
  const userRoles = user?.roles || [];
  const hasRole = userRoles.some((r) => roles.includes(r));

  if (!isAuth || !hasRole) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}