import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { CircularProgress, Box, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

// ✅ Animation de fade-in
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// ✅ Animation de bounce pour le logo
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

// ✅ Animation de rotation
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuth, isLoading, user } = useAuth();

  console.log("ProtectedRoute:", { isAuth, isLoading, user });

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          animation: `${fadeIn} 0.5s ease-in`,
        }}
      >
        <Box
          sx={{
            mb: 3,
            animation: `${bounce} 2s infinite`,
          }}
        >
          <img
            src="/download.png"
            alt="Loading"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
            }}
          />
        </Box>

        <CircularProgress
          size={60}
          sx={{
            color: "white",
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 600,
            animation: `${fadeIn} 1s ease-in-out infinite alternate`,
            mt: 2,
          }}
        >
          Loading MyScholaria...
        </Typography>
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

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          animation: `${fadeIn} 0.5s ease-in`,
        }}
      >
        <Box
          sx={{
            mb: 3,
            animation: `${bounce} 2s infinite`,
          }}
        >
          <img
            src="/download.png"
            alt="Loading"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
            }}
          />
        </Box>

        <CircularProgress
          size={60}
          sx={{
            color: "white",
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 600,
            animation: `${fadeIn} 1s ease-in-out infinite alternate`,
            mt: 2,
          }}
        >
          Checking permissions...
        </Typography>
      </Box>
    );

  const userRoles = user?.roles || [];
  const hasRole = userRoles.some((r) => roles.includes(r));

  if (!isAuth || !hasRole) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
