import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Stack, Link, Alert, useTheme } from "@mui/material";
import MailLockIcon from "@mui/icons-material/MailLock";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const  theme  = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
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
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <MailLockIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Forgot password?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Enter your email and we'll send you a reset link
            </Typography>
          </Stack>

          {sent ? (
            <Alert severity="success">
              A reset link has been sent to <b>{email}</b> (mockup).
            </Alert>
          ) : (
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
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Send Reset Link
                </Button>
              </Stack>
            </Box>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Remember your password?{" "}
            <Link component={RouterLink} to="/auth/signin" fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
