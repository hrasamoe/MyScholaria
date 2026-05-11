import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  useTheme,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { login } from "@/services/auth.service";
import { useAuth } from "@/hooks/Authcontext";
import { useSnackbar } from "notistack";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const data = await login(email, password);
      saveAuth(data.user, data.accessToken, data.refreshToken);
      navigate("/");
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, {
        variant: "error",
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.divider} 50%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} alignItems="center" mb={3}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                // bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <img src="/download.png" width={90} />
              {/* <SchoolIcon fontSize="large" /> */}
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome to MyScholaria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel
                  control={<Checkbox defaultChecked size="small" />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link
                  component={RouterLink}
                  to="/auth/forgot-password"
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Stack>
              <Button type="submit" variant="contained" size="large" fullWidth>
                {isLoading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<img src="/google.png" width={20} />}
            >
              Continue with Google
            </Button>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Don't have an account?{" "}
            <Link component={RouterLink} to="/auth/signup" fontWeight={600}>
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignIn;
