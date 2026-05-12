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
  Link,
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

  const steps = ["Email Verified", "Establishment Info", "Confirm"];

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Validation de l'étape 1 (Info établissement)
      if (
        !form.establishmentCode ||
        !form.establishmentName ||
        !form.address ||
        !form.city ||
        !form.zipCode ||
        !form.country
      ) {
        setError("Please fill all required fields");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

          {/* Step 0: Email Verified */}
          {activeStep === 0 && (
            <Box>
              <Stack spacing={2} alignItems="center" my={4}>
                <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
                <Typography variant="h6" fontWeight={600} textAlign="center">
                  Email Verified Successfully!
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Welcome, <strong>{user?.full_name}</strong>. Now let's set up
                  your establishment.
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Step 1: Establishment Info */}
          {activeStep === 1 && (
            <Box component="form">
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
              </Grid>
            </Box>
          )}

          {/* Step 2: Confirm */}
          {activeStep === 2 && (
            <Box>
              <Stack spacing={2} my={4}>
                <Typography variant="h6" fontWeight={600}>
                  Review Your Information
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Establishment Code
                      </Typography>
                      <Typography fontWeight={600}>
                        {form.establishmentCode}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Establishment Name
                      </Typography>
                      <Typography fontWeight={600}>
                        {form.establishmentName}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Street Address
                      </Typography>
                      <Typography fontWeight={600}>{form.address}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        City
                      </Typography>
                      <Typography fontWeight={600}>{form.city}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Zip Code
                      </Typography>
                      <Typography fontWeight={600}>{form.zipCode}</Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Country
                      </Typography>
                      <Typography fontWeight={600}>{form.country}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Alert severity="info">
                  Make sure all information is accurate. You can update these
                  details later in your account settings.
                </Alert>
              </Stack>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              fullWidth
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Establishment"
                )}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} fullWidth>
                Next
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Need help? Contact our{" "}
            <Link
              href="mailto:hrasamoevj@gmail.com"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              support team
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEstablishment;
