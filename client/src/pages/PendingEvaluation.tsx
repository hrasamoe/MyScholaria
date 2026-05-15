import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import BusinessIcon from "@mui/icons-material/Business";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useAuth } from "@/hooks/Authcontext";
import { logout } from "@/services/auth.service";

const steps = [
  { label: "Account created", done: true },
  { label: "Email verified", done: true },
  { label: "Waiting for admin approval", done: false, current: true },
  { label: "Access granted", done: false },
];

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const theme = useTheme();

  const handleSignOut = async () => {
    await clearAuth();
    navigate("/auth/signin");
  };

  if (user.is_aproved) {
    return <Navigate to="/" replace />;
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Card variant="outlined">
          <CardContent
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: theme.palette.background.default,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HourglassEmptyIcon
                sx={{ fontSize: 32, color: "warning.main" }}
              />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Waiting for approval
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.7}
              >
                Your account has been created and your email is verified. An
                administrator needs to approve your access before you can use
                the platform.
              </Typography>
            </Box>

            <Box
              sx={{
                width: "100%",
                bgcolor: "background.default",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                textAlign: "left",
              }}
            >
              {steps.map((step, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                >
                  {step.done ? (
                    <CheckCircleIcon
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{
                        fontSize: 18,
                        color: step.current ? "warning.main" : "text.disabled",
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    color={
                      step.done
                        ? "text.primary"
                        : step.current
                          ? "text.secondary"
                          : "text.disabled"
                    }
                  >
                    {step.label}
                  </Typography>
                </Stack>
              ))}
            </Box>

            <Box
              sx={{
                width: "100%",
                bgcolor: theme.palette.background.default,

                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                textAlign: "left",
              }}
            >
              <MailOutlineIcon
                sx={{
                  fontSize: 16,
                  color: "info.main",
                  mt: 0.25,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="info.dark" lineHeight={1.6}>
                You'll receive an email notification once your account is
                approved. This usually takes less than 24 hours.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent
            sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BusinessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Establishment
              </Typography>
              <Typography variant="body2" fontWeight={500} noWrap>
                {user?.establishment_name || "Your establishment"}
              </Typography>
            </Box>
            <Chip label="Pending" color="warning" size="small" />
          </CardContent>
        </Card>

        <Stack spacing={1}>
          <Button
            variant="outlined"
            fullWidth
            href="mailto:herysamuelpl@gmail.com"
          >
            Contact support
          </Button>
          <Button
            variant="text"
            fullWidth
            color="inherit"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PendingApproval;
