import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  LinearProgress,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "notistack";
import { register } from "../services/auth.service";
import { useAuth } from "../hooks/Authcontext";

const passwordStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (/[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 25;
  if (/[^A-Za-z0-9]/.test(pw)) s += 25;
  return s;
};

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student",
    schoolName: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [emailSent, setEmailSent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { saveAuth } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const strength = passwordStrength(form.password);
  const strengthLabel =
    strength < 50
      ? "Weak"
      : strength < 75
        ? "Fair"
        : strength < 100
          ? "Good"
          : "Strong";
  const strengthColor: any =
    strength < 50 ? "error" : strength < 75 ? "warning" : "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill all required fields");
      return;
    }
    if (form.role === "Admin" && !form.schoolName) {
      setError("School name is required for administrators");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!form.terms) {
      setError("You must accept the terms");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await register(
        form.email,
        form.password,
        `${form.firstName} ${form.lastName}`,
        form.role.toLowerCase(),
        // form.schoolName,
      );
      enqueueSnackbar("Account created", { variant: "success" });
      setEmailSent(true);
    } catch (err: any) {
      enqueueSnackbar(`An error occurred: ${err.message}`, {
        variant: "error",
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Check your inbox!
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          We sent a confirmation email to <strong>{form.email}</strong>.<br />
          Click the link to activate your account.
        </Typography>
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
        bgcolor: "background.default",
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
              }}
            >
              <img src="/download.png" height="100%" alt="Logo" />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join MyScholaria in less than a minute
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Divider sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    I AM A
                  </Typography>
                </Divider>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant={form.role === "Admin" ? "contained" : "outlined"}
                    onClick={() => setForm({ ...form, role: "Admin" })}
                  >
                    Admin
                  </Button>
                  <Button
                    fullWidth
                    variant={form.role !== "Admin" ? "contained" : "outlined"}
                    onClick={() => setForm({ ...form, role: "Student" })}
                  >
                    Member
                  </Button>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First name *"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last name *"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="School Name *"
                    placeholder="e.g. Lycée de Tana"
                    value={form.schoolName}
                    onChange={(e) =>
                      setForm({ ...form, schoolName: e.target.value })
                    }
                  />
                </Grid>
            

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Grid>

              {/* {form.role !== "Admin" && (
                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={form.role}
                      label="Role"
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <MenuItem value="Student">Student</MenuItem>
                      <MenuItem value="Parent">Parent</MenuItem>
                      <MenuItem value="Teacher">Teacher</MenuItem>
                      <MenuItem value="Staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )} */}

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Password *"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw(!showPw)}
                          edge="end"
                        >
                          {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {form.password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={strength}
                      color={strengthColor}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography
                      variant="caption"
                      color={`${strengthColor}.main`}
                    >
                      Password strength: {strengthLabel}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Confirm password *"
                  type={showPw ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.terms}
                      onChange={(e) =>
                        setForm({ ...form, terms: e.target.checked })
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the{" "}
                      <Link component={RouterLink} to="/terms" target="_blank">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link component={RouterLink} target="_blank" to="/policy">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
              </Grid>
              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : form.role === "Admin" ? (
                    "Register School"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<img src="/google.png" width={20} alt="Google" />}
          >
            Sign up with Google
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Already have an account?{" "}
            <Link component={RouterLink} to="/auth/signin" fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;
