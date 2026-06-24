import PageHeader from "@/components/PageHeader";
import { TEACHER_SUBJECTS, TeacherSubject } from "@/data/type";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export type ContractType = "permanent" | "contract" | "vacation";

interface TeacherForm {
  idNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  hire_date: string;
  phone: string;
  address: string;
  subject: TeacherSubject | "";
  qualification: string;
  contractType: ContractType | "";
  hoursPerDay: string;
}

const CONTRACT_TYPES: ContractType[] = ["permanent", "contract", "vacation"];

const CreateTeacher = () => {
  const [form, setForm] = useState<Partial<TeacherForm>>({
    idNumber: "",
    gender: "male",
    firstName: "",
    lastName: "",
    email: "",
    hire_date: "",
    phone: "",
    address: "",
    subject: "",
    qualification: "",
    contractType: "",
    hoursPerDay: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const navigate = useNavigate();
  const establishmentID = user?.establishment_id;
  const [loading, setLoading] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleCancel = () => {
    setForm({
      idNumber: "",
      gender: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      subject: "",
      qualification: "",
      hire_date: "",
      contractType: "",
      hoursPerDay: "",
    });
    setErrors({});
    setRgpdAccepted(false);
    navigate("/teachers");
  };

  const handleSave = async () => {
    setErrors({});

    if (
      !form.idNumber ||
      !form.firstName ||
      !form.lastName ||
      !form.subject ||
      !form.hire_date
    ) {
      enqueueSnackbar("Please fill all required fields (*)", {
        variant: "error",
      });
      return;
    }
    if (
      form.subject &&
      !TEACHER_SUBJECTS.includes(form.subject as TeacherSubject)
    ) {
      enqueueSnackbar(
        `This ${form.subject} is not in the standard list, please select a valid option`,
        {
          variant: "warning",
        },
      );
  
      return;
    }
    if (!rgpdAccepted) {
      enqueueSnackbar("You must acknowledge the data protection notice", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest(`/api/teachers/create-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          IDNumber: form.idNumber,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          gender: form.gender,
          hire_date: form.hire_date,
          subject: form.subject,
          phone: form.phone,
          address: form.address,
          qualification: form.qualification,
          contractType: form.contractType,
          hpw: form.hoursPerDay ? parseInt(form.hoursPerDay) : 0,
          fullname: form.firstName + " " + form.lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      enqueueSnackbar("Teacher profile created successfully", {
        variant: "success",
      });
      handleCancel();
    } catch (error: any) {
      const errorMessage = error.message || error.error || "An error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });

      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Create New Teacher Profile"
        subtitle="Register a new educator account in the system"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            disabled={loading}
          >
            Back to List
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Identification & Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="ID Number *"
              value={form.idNumber || ""}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              disabled={loading}
              error={!!errors.IDNumber}
              helperText={errors.IDNumber}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name *"
              value={form.firstName || ""}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={loading}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name *"
              value={form.lastName || ""}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={loading}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl
              component="fieldset"
              disabled={loading}
              error={!!errors.gender}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "56px",
                borderRadius: 1,
                border: errors.gender ? "1px solid #d32f2f" : "none",
                px: 2,
              }}
            >
              <FormLabel
                component="legend"
                sx={{
                  fontSize: "0.95rem",
                  color: errors.gender ? "#d32f2f" : "text.secondary",
                  textAlign: "center",
                  mb: 0.5,
                }}
              >
                Gender
              </FormLabel>
              <RadioGroup
                row
                value={form.gender || ""}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                sx={{ justifyContent: "space-between", width: "100%" }}
              >
                <FormControlLabel
                  value="male"
                  control={<Radio size="small" />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  sx={{ fontSize: "0.95rem" }}
                  control={<Radio size="small" />}
                  label="Female"
                />
              </RadioGroup>
              {errors.gender && (
                <FormHelperText color="error">{errors.gender}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Qualification"
              value={form.qualification || ""}
              onChange={(e) =>
                setForm({ ...form, qualification: e.target.value })
              }
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Academic Assignment & Contract
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Hire Date *"
              type="date"
              value={form.hire_date || ""}
              onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.hire_date}
              helperText={errors.hire_date}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              freeSolo
              options={TEACHER_SUBJECTS}
              value={form.subject || ""}
              onChange={(_, newValue) => {
                setForm({
                  ...form,
                  subject: (newValue as TeacherSubject) || "",
                });
              }}
              onInputChange={(_, newInputValue) => {
                setForm({ ...form, subject: newInputValue as TeacherSubject });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Main Subject *"
                  fullWidth
                  error={!!errors.subject}
                  helperText={errors.subject}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Contract Type"
              value={form.contractType || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  contractType: e.target.value as ContractType,
                })
              }
              disabled={loading}
              error={!!errors.contractType}
              helperText={errors.contractType}
            >
              {CONTRACT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.toUpperCase().charAt(0) + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Hours Per Week"
              type="number"
              slotProps={{
                htmlInput: { min: 0, max: 40, step: 1 },
              }}
              value={form.hoursPerDay || ""}
              onChange={(e) =>
                setForm({ ...form, hoursPerDay: e.target.value })
              }
              disabled={loading}
              error={!!errors.hpw}
              helperText={errors.hpw}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Contact details & Address
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
              error={!!errors.phone}
              helperText={errors.phone || "Format: +2613XXXXXXXX or 03XXXXXXXX"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Home Address"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={loading}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Data Protection Notice (RGPD)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The personal data collected through this form is strictly intended
            for professional, academic, and administrative management within our
            establishment. It will not be shared with third parties without your
            explicit consent and will be retained in accordance with legal
            durations defined by data protection regulations.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rgpdAccepted}
                onChange={(e) => setRgpdAccepted(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label="I acknowledge that I have read and understood the data protection notice *"
          />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
        >
          <Button variant="outlined" onClick={handleCancel} disabled={loading}>
            Reset Form
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!rgpdAccepted || loading}
          >
            {loading ? "Saving..." : "Save Teacher"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTeacher;
