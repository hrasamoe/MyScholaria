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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks/Authcontext";
import { apiRequest } from "@/services/api.service";

const CreateEstablishment = () => {
  const [form, setForm] = useState({
    // Étape 1 - Info de base
    name: "",
    code: "",
    type: "primary",
    identificationNumber: "",
    zipCode: "",
    city: "",
    address: "",
    phone: "",
    email: "",

    joinCode: "",
    adminCode: "",
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const steps = [
    "Email Verified",
    "Basic Info",
    "Contact Details",
    "Access Codes",
    "Confirm",
  ];

  const establishmentTypes = [
    { value: "primary", label: "Primary School" },
    { value: "middle", label: "Middle School" },
    { value: "high", label: "High School" },
    { value: "university", label: "University" },
    { value: "other", label: "Other" },
  ];

  // Générer un code aléatoire
  const generateCode = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Validation Étape 1 - Info de base
      if (!form.name || !form.code || !form.type) {
        setError("Please fill all required fields: Name, Code, Type");
        return false;
      }
      // Vérifier que le code commence par EST ou est valide
      if (!/^[A-Z0-9\-]+$/.test(form.code)) {
        setError(
          "Establishment code must contain only uppercase letters, numbers and hyphens",
        );
        return false;
      }
    } else if (step === 2) {
      // Validation Étape 2 - Contact
      if (!form.address || !form.phone || !form.email) {
        setError("Please fill all contact details");
        return false;
      }
      // Validation email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      // Validation téléphone
      if (!/^\d{10,}$/.test(form.phone.replace(/[\s\-()]/g, ""))) {
        setError("Please enter a valid phone number");
        return false;
      }
    } else if (step === 3) {
      // Validation Étape 3 - Codes d'accès
      if (!form.joinCode || !form.adminCode) {
        setError("Join code and admin code are required");
        return false;
      }
      if (form.joinCode.length < 6) {
        setError("Join code must be at least 6 characters");
        return false;
      }
      if (form.adminCode.length < 6) {
        setError("Admin code must be at least 6 characters");
        return false;
      }
      if (form.joinCode === form.adminCode) {
        setError("Join code and admin code must be different");
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

  const handleAutoGenerateCode = (codeType: "join" | "admin") => {
    if (codeType === "join") {
      setForm({ ...form, joinCode: generateCode() });
    } else {
      setForm({ ...form, adminCode: generateCode() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await apiRequest(`/api/establishment/create`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,

            code: form.code,
            type: form.type,
            identificationNumber: form.identificationNumber || null,
            address: form.address,
            city: form.city,
            zipCode: form.zipCode,
            phone: form.phone,
            email: form.email,
            joinCode: form.joinCode,
            adminCode: form.adminCode,
            isActive: true,
            ownerId: user?.id,
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
        navigate("/");
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
                Your establishment <strong>{form.name}</strong> has been
                successfully registered. You will be redirected to your
                dashboard.
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
      <Card sx={{ width: "100%", maxWidth: 800, my: 3 }}>
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
              Set up your establishment in a few steps
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

          {/* Step 1: Basic Info */}
          {activeStep === 1 && (
            <Box component="form">
              <Grid container spacing={2}>
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

                {/* Establishment Name */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Establishment Name *"
                    placeholder="e.g. Milan High School"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    helperText="Official name of your institution"
                  />
                </Grid>

                {/* Establishment Code */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Establishment Code *"
                    placeholder="e.g. EST-2024-001"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    helperText="Unique identifier (uppercase, numbers, hyphens)"
                  />
                </Grid>

                {/* Type */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Establishment Type *</InputLabel>
                    <Select
                      value={form.type}
                      label="Establishment Type *"
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      {establishmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Identification Number */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Identification Number (Optional)"
                    placeholder="e.g. VAT number, Registration number"
                    value={form.identificationNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        identificationNumber: e.target.value,
                      })
                    }
                    helperText="Tax ID, VAT number, or official registration number"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Contact Details */}
          {activeStep === 2 && (
            <Box component="form">
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Divider sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="primary" />
                      <EmailIcon fontSize="small" color="primary" />
                      <Typography variant="caption" color="text.secondary">
                        CONTACT & LOCATION
                      </Typography>
                    </Stack>
                  </Divider>
                </Grid>

                {/* Address */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Address *"
                    placeholder="e.g. 123 Main Street"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </Grid>

                {/* Phone */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="ZIP CODE *"
                    placeholder="e.g. 101"
                    value={form.zipCode}
                    onChange={(e) =>
                      setForm({ ...form, zipCode: e.target.value })
                    }
                    type="text"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="City *"
                    placeholder="e.g. Antananrivo"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    type="tel"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    placeholder="e.g. +39 123 456 7890"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    type="tel"
                  />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    placeholder="e.g. contact@school.com"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Grid>

                {/* Info Message */}
                <Grid size={12}>
                  <Alert severity="info">
                    These details will be used for official communications and
                    directory listings.
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Access Codes */}
          {activeStep === 3 && (
            <Box component="form">
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Divider sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      ACCESS CODES
                    </Typography>
                  </Divider>
                </Grid>

                {/* Join Code */}
                <Grid size={12}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Join Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Users will use this code to join your establishment
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      label="Join Code *"
                      placeholder="e.g. ABC123"
                      value={form.joinCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          joinCode: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleAutoGenerateCode("join")}
                    >
                      Generate
                    </Button>
                  </Stack>
                </Grid>

                {/* Admin Code */}
                <Grid size={12}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Admin Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Only administrators can use this code to register
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      label="Admin Code *"
                      placeholder="e.g. DEF456"
                      value={form.adminCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          adminCode: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleAutoGenerateCode("admin")}
                    >
                      Generate
                    </Button>
                  </Stack>
                </Grid>

                {/* Info Message */}
                <Grid size={12}>
                  <Alert severity="warning">
                    Keep these codes safe. You can regenerate them later, but
                    existing users won't be able to join with old codes.
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 4: Confirm */}
          {activeStep === 4 && (
            <Box>
              <Stack spacing={3} my={4}>
                <Typography variant="h6" fontWeight={600}>
                  Review Your Information
                </Typography>

                {/* Basic Info Review */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Institution Name
                      </Typography>
                      <Typography fontWeight={600}>{form.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Code
                      </Typography>
                      <Typography fontWeight={600}>{form.code}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {form.type}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        ID Number
                      </Typography>
                      <Typography fontWeight={600}>
                        {form.identificationNumber || "Not provided"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Contact Info Review */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography fontWeight={600}>{form.address}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography fontWeight={600}>{form.phone}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography fontWeight={600}>{form.email}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Access Codes Review */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Access Codes
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Join Code
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.9rem",
                        }}
                      >
                        {form.joinCode}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Admin Code
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.9rem",
                        }}
                      >
                        {form.adminCode}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Alert severity="success">
                  Everything looks good! Click "Create Establishment" to
                  finalize the setup.
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
              {" "}
              support team
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEstablishment;
