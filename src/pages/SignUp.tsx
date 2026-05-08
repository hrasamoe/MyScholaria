import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography, Stack, Divider,
  IconButton, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Link, Alert, LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { useSnackbar } from "notistack";

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
    firstName: "", lastName: "", email: "", role: "Student",
    password: "", confirm: "", terms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const strength = passwordStrength(form.password);
  const strengthLabel = strength < 50 ? "Weak" : strength < 75 ? "Fair" : strength < 100 ? "Good" : "Strong";
  const strengthColor: any = strength < 50 ? "error" : strength < 75 ? "warning" : "success";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill all required fields"); return;
    }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!form.terms) { setError("You must accept the terms"); return; }
    setError("");
    enqueueSnackbar("Account created (mockup)", { variant: "success" });
    navigate("/auth/signin");
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "background.default", p: 2,
      background: "linear-gradient(135deg, #e3f2fd 0%, #f7f9fc 50%, #fff 100%)",
    }}>
      <Card sx={{ width: "100%", maxWidth: 520, my: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} alignItems="center" mb={3}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 2, bgcolor: "primary.main",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <SchoolIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight={700}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary">Join Scholara in less than a minute</Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="First name *" value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Last name *" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Email *" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={form.role} label="Role"
                    onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Parent">Parent</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth label="Password *" type={showPw ? "text" : "password"}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw(!showPw)} edge="end">
                          {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {form.password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress variant="determinate" value={strength} color={strengthColor} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color={`${strengthColor}.main`}>Password strength: {strengthLabel}</Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Confirm password *" type={showPw ? "text" : "password"}
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />}
                  label={<Typography variant="body2">I accept the <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link></Typography>}
                />
              </Grid>
              <Grid size={12}>
                <Button type="submit" variant="contained" size="large" fullWidth>Create Account</Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button variant="outlined" fullWidth startIcon={<GoogleIcon />}>Sign up with Google</Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            Already have an account? <Link component={RouterLink} to="/auth/signin" fontWeight={600}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;
