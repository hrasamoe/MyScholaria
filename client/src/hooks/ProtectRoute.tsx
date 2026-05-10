import { Navigate, replace } from "react-router-dom";
import { useAuth } from "./Authcontext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuth) return <Navigate to="auth/signin" replace />;

  return <>{children}</>;
}

export function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { user } = useAuth();
  const hasROle = user?.roles.some((r) => roles.includes(r));
  if (!hasROle) return <Navigate to="/" replace />;
  return <>{children}</>;
}
