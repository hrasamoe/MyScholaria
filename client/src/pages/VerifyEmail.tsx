import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}`,
    )
      .then((res) => {
        if (res.ok || res.redirected) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      {status === "loading" && (
        <>
          <CircularProgress />
          <Typography>Verifying your email...</Typography>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Email verified !
          </Typography>
          <Typography color="text.secondary">
            Your account is now active.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/auth/signin")}>
            Sign in
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Invalid link
          </Typography>
          <Typography color="text.secondary">
            This link is expired or invalid.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/auth/signup")}>
            Sign up again
          </Button>
        </>
      )}
    </Box>
  );
}
