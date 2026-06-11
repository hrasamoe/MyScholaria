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
  Link,
  Alert,
  useTheme,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { login } from "@/services/auth.service";
import { useAuth } from "@/hooks/Authcontext";
import { useSnackbar } from "notistack";
import { apiRequest } from "@/services/api.service";

const API_URL = import.meta.env.VITE_API_URL;

const steps = ["Credentials", "Establishment"];

const SignIn = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const data = await login(email, password);
      setTempUser(data.user);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !joinCode) {
      setError("Establishment code and join code are required");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await apiRequest(`/api/establishment/select`, {
        method: "POST",
        credentials: "include",

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, joinCode }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      const fullUser = {
        ...tempUser,
        establishment_id: result.data.establishment_id,
        establishment_name: result.data.establishment_name,
        is_aproved: result.data.is_aproved,
      };

      saveAuth(fullUser);
      enqueueSnackbar("Signed in successfully", { variant: "success" });
      navigate("/");
    } catch (err: any) {
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="/download.png" width={90} alt="Logo" />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome to MyScholaria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Stack>

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box component="form" onSubmit={handleStep1}>
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
                <Link
                  component={RouterLink}
                  to="/auth/forgot-password"
                  variant="body2"
                  sx={{ alignSelf: "flex-end" }}
                >
                  Forgot password?
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </Stack>
            </Box>
          )}

          {activeStep === 1 && (
            <Box component="form" onSubmit={handleStep2}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Enter your establishment credentials to complete sign in.
                </Typography>
                <TextField
                  fullWidth
                  label="Establishment code"
                  placeholder="e.g. MSN-456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Join code"
                  type={showPassword ? "text" : "password"}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
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
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setActiveStep(0);
                      setError("");
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<img src="/google.png" width={20} alt="Google" />}
          >
            Continue with Google
          </Button>

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
