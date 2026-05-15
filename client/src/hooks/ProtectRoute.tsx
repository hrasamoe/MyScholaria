import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { CircularProgress, Box, Typography } from "@mui/material";
import { keyframes, useTheme } from "@mui/material/styles";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

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
  const theme = useTheme();
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
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            color: `${theme.palette.text.primary}`,
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: `${theme.palette.text.primary}`,
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
  const theme = useTheme();
  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            color: `${theme.palette.text.primary}`,
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: `${theme.palette.text.primary}`,
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

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { isLoading, isAuth, user } = useAuth();
  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            color: `${theme.palette.text.primary}`,
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: `${theme.palette.text.primary}`,
            fontWeight: 600,
            animation: `${fadeIn} 1s ease-in-out infinite alternate`,
            mt: 2,
          }}
        >
          Checking permissions...
        </Typography>
      </Box>
    );
  if (isAuth && user) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function PendinRoute({ children }: { children?: ReactNode }) {
  const { isAuth, isLoading, user } = useAuth();
  const theme = useTheme();
  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            color: `${theme.palette.text.primary}`,
            mb: 2,
            animation: `${spin} 1s linear infinite`,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: `${theme.palette.text.primary}`,
            fontWeight: 600,
            animation: `${fadeIn} 1s ease-in-out infinite alternate`,
            mt: 2,
          }}
        >
          Checking permissions...
        </Typography>
      </Box>
    );
  if (!isAuth) {
    return <Navigate to="/auth/signin" replace />;
  }
  if (user?.is_aproved === false)
    return <Navigate to="/pending-aproval" replace />;
  return children ? <>{children}</> : <Outlet />;
}
