import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks/Authcontext";

const CreateEstablishment = () => {
  const [form, setForm] = useState({
    establishmentCode: "",
    establishmentName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const steps = ["Verify Email", "Establishment Info", "Confirm"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.establishmentCode ||
      !form.establishmentName ||
      !form.address ||
      !form.city ||
      !form.zipCode ||
      !form.country
    ) {
      setError("Please fill all required fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/establishment/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: form.establishmentCode,
            name: form.establishmentName,
            address: form.address,
            city: form.city,
            zipCode: form.zipCode,
            country: form.country,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create establishment");
      }

      enqueueSnackbar("Establishment created successfully", {
        variant: "success",
      });
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: "error" });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            <Stack spacing={2} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
              <Typography variant="h5" fontWeight={700}>
                Establishment Created!
              </Typography>
              <Typography color="text.secondary" textAlign="center">
                Your establishment has been successfully registered. You will be
                redirected to your dashboard.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
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
      <Card sx={{ width: "100%", maxWidth: 600, my: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
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
              Complete Your Setup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provide your establishment information
            </Typography>
          </Stack>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
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

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Section Title */}
              <Grid size={12}>
                <Divider sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessIcon fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      ESTABLISHMENT INFORMATION
                    </Typography>
                  </Stack>
                </Divider>
              </Grid>

              {/* Establishment Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Establishment Code *"
                  placeholder="e.g. EST-2024-001"
                  value={form.establishmentCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      establishmentCode: e.target.value.toUpperCase(),
                    })
                  }
                  helperText="Unique identifier for your establishment"
                />
              </Grid>

              {/* Establishment Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Establishment Name *"
                  placeholder="e.g. Milan High School"
                  value={form.establishmentName}
                  onChange={(e) =>
                    setForm({ ...form, establishmentName: e.target.value })
                  }
                />
              </Grid>

              {/* Address */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Street Address *"
                  placeholder="e.g. 123 Main Street"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </Grid>

              {/* City */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City *"
                  placeholder="e.g. Milan"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Grid>

              {/* Zip Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Zip Code *"
                  placeholder="e.g. 20100"
                  value={form.zipCode}
                  onChange={(e) =>
                    setForm({ ...form, zipCode: e.target.value })
                  }
                />
              </Grid>

              {/* Country */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Country *"
                  placeholder="e.g. Italy"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
              </Grid>

              {/* Submit Button */}
              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Create Establishment"
                  )}
                </Button>
              </Grid>

              {/* Info Message */}
              <Grid size={12}>
                <Alert severity="info">
                  Make sure all information is accurate. You can update these
                  details later in your account settings.
                </Alert>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Need help? Contact our{" "}
            <Box
              component="span"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              support team
            </Box>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEstablishment;
