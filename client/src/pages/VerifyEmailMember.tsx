import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useAuth } from "@/hooks/Authcontext";
import { useSnackbar } from "notistack";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmailMember() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hasVerified = useRef(false);
  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    const verifyEmail = async () => {
      const token = params.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/auth/verify-email-member?token=${token}`,
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        if (res.ok) {
          saveAuth(data.user);
          await fetch(`${API_URL}/api/establishment/join`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userID: data.user.id,
              establishmentID: data.establishment_id,
              role: data.user.roles[0] || "student",
            }),
          });
          setStatus("success");
        } else {
          setStatus("error");
          enqueueSnackbar(data.message || "Verification failed", {
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        enqueueSnackbar("An error occurred during verification", {
          variant: "error",
        });
      }
    };

    verifyEmail();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
      p={isMobile ? 2 : 3}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 500,
          textAlign: "center",
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={isMobile ? 40 : 48} />
            <Typography variant={isMobile ? "body1" : "h6"}>
              Verifying your email...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: isMobile ? 56 : 72, color: "success.main" }}
            />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
              Email verified successfully!
            </Typography>

            <Box
              sx={{
                bgcolor: "info.light",
                p: 2,
                borderRadius: 2,
                color: "info.contrastText",
                my: 1,
                width: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                display="flex"
                alignItems="center"
                justifyContent="center"
                // gap: 1,
              >
                <HourglassEmptyIcon fontSize="small" /> Account pending approval
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Your email has been confirmed. An administrator will review and
              activate your account soon.
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic", mt: 1 }}
            >
              You will receive an email notification once approved.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon
              sx={{ fontSize: isMobile ? 56 : 72, color: "error.main" }}
            />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
              Invalid or expired link
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The verification token may have expired or has already been used.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/auth/signup")}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Back to Sign Up
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
