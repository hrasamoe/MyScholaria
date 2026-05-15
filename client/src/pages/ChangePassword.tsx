import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Alert,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Grid } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";

const checks = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

interface ChangePasswordProps {
  token?: string;
}

const ChangePassword = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const c = checks(next);
  const score = Object.values(c).filter(Boolean).length * 25;
  const valid = Object.values(c).every(Boolean);
  const color: "error" | "warning" | "success" =
    score < 50 ? "error" : score < 75 ? "warning" : "success";
  const strengthLabel =
    score < 50 ? "Weak" : score < 75 ? "Fair" : score < 100 ? "Good" : "Strong";

  const resetAll = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!token && !current) || !next || !confirm) {
      setError("All fields are required");
      setSuccess("");
      return;
    }
    if (!valid) {
      setError("Password does not meet requirements");
      setSuccess("");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match");
      setSuccess("");
      return;
    }
    if (!token && next === current) {
      setError("New password must differ from current");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("Password changed successfully (mockup)");
    enqueueSnackbar("Password changed successfully (mockup)", {
      variant: "success",
    });
    setCurrent("");
    setNext("");
    setConfirm("");
  };

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
      <Card sx={{ width: "100%", maxWidth: 520, my: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} alignItems="center" mb={3}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.light",
                mb: 1,
              }}
            >
              <LockResetIcon color="primary" sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Change your password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your account password regularly to stay secure.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {!token && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Current password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
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
                </Grid>
              )}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="New password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
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
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      color={color}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color={`${color}.main`}>
                      Password strength: {strengthLabel}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={!!confirm && confirm !== next}
                  helperText={
                    !!confirm && confirm !== next
                      ? "Passwords do not match"
                      : ""
                  }
                />
              </Grid>
              <Grid size={12}>
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
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button onClick={resetAll}>Cancel</Button>
                  <Button type="submit" variant="contained">
                    Update Password
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
