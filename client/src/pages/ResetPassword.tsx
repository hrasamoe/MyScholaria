import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import LockResetIcon from "@mui/icons-material/LockReset";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const checks = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

const Req = ({ ok, label }: { ok: boolean; label: string }) => (
  <ListItem dense disableGutters>
    <ListItemIcon sx={{ minWidth: 28 }}>
      {ok ? (
        <CheckCircleIcon color="success" fontSize="small" />
      ) : (
        <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
      )}
    </ListItemIcon>
    <ListItemText
      primary={
        <Typography
          variant="body2"
          color={ok ? "success.main" : "text.secondary"}
        >
          {label}
        </Typography>
      }
    />
  </ListItem>
);

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const token = params.get("token");
  const isReset = !!token; // true = vient de l'email, false = changement depuis settings

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const c = checks(next);
  const score = Object.values(c).filter(Boolean).length * 25;
  const valid = Object.values(c).every(Boolean);
  const color: any = score < 50 ? "error" : score < 75 ? "warning" : "success";

  useEffect(() => {
    if (!isReset) {
      setTokenValid(true);
      return;
    }
    apiRequest(`/api/auth/verify-reset-token?token=${encodeURIComponent(token!)}`,
      {
        credentials: "include",
      },
    )
      .then((res) => setTokenValid(res.ok))
      .catch(() => setTokenValid(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError("Password does not meet requirements");
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await apiRequest(`/api/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      saveAuth(data.user);
      enqueueSnackbar("Password reset successfully", { variant: "success" });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Token invalide
  if (isReset && tokenValid === false) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.divider} 50%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: "error.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Invalid or expired link
        </Typography>
        <Typography color="text.secondary">
          Please request a new password reset.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/auth/forgot-password")}
        >
          Try again
        </Button>
      </Box>
    );
  }

  // Chargement vérification token
  if (isReset && tokenValid === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.divider} 50%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 560 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <LockResetIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              {isReset ? "Set a new password" : "Update password"}
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="New password"
                type={show ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow(!show)} edge="end">
                        {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {next && (
                <LinearProgress
                  variant="determinate"
                  value={score}
                  color={color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              )}
              <TextField
                fullWidth
                label="Confirm new password"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                error={!!confirm && confirm !== next}
                helperText={
                  !!confirm && confirm !== next ? "Passwords do not match" : ""
                }
              />

              <Box
                sx={{ bgcolor: "background.default", p: 2, borderRadius: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  PASSWORD REQUIREMENTS
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <Req ok={c.length} label="At least 8 characters" />
                  <Req ok={c.upper} label="One uppercase letter" />
                  <Req ok={c.number} label="One number" />
                  <Req ok={c.special} label="One special character" />
                </List>
              </Box>

              <Button type="submit" variant="contained" size="large" fullWidth>
                {isLoading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isReset ? (
                  "Reset Password"
                ) : (
                  "Update Password"
                )}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
