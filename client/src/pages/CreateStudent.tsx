import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Chip,
  FormHelperText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

interface StudentForm {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  student_number: string;
  enrollment_date: string;
  class_id: string;
  status: "active" | "inactive" | "suspended" | "graduated";
  medical_notes: string;
  photo_url: string;
  parent_ids: string[];
}

interface ParentOption {
  id: string;
  fullName: string;
  phone: string;
}

interface ClassOption {
  id: string;
  className: string;
}

const CreateStudent = () => {
  const [form, setForm] = useState<Partial<StudentForm>>({
    status: "active",
    enrollment_date: new Date().toISOString().split("T")[0],
    parent_ids: [],
    class_id: "",
    medical_notes: "",
  });
  const navigate = useNavigate();
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [medicalConsentAccepted, setMedicalConsentAccepted] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [parentOptions] = useState<ParentOption[]>([
    {
      id: "404dbc2c-865e-43c8-8796-8398a5942256",
      fullName: "Heritiana Hasina",
      phone: "0340000001",
    },
    {
      id: "a1e922e1-4202-4430-95a8-8cc6e902e566",
      fullName: "Naël Hasinirina",
      phone: "0340000002",
    },
  ]);

  const [classOptions] = useState<ClassOption[]>([
    { id: "c1", className: "Grade 10 - A" },
    { id: "c2", className: "Grade 11 - B" },
    { id: "c3", className: "Terminalos S" },
  ]);

  const handleCancel = () => {
    setForm({
      status: "active",
      enrollment_date: new Date().toISOString().split("T")[0],
      parent_ids: [],
      class_id: "",
      medical_notes: "",
    });
    setRgpdAccepted(false);
    setMedicalConsentAccepted(false);
  };

  const handleSave = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.student_number ||
      !form.enrollment_date ||
      !form.status
    ) {
      enqueueSnackbar("Please fill all required fields (*)", {
        variant: "error",
      });
      return;
    }

    if (form.medical_notes?.trim() && !medicalConsentAccepted) {
      enqueueSnackbar(
        "You must obtain explicit consent to save health-related data",
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

    try {
      enqueueSnackbar("Student created successfully", { variant: "success" });
      handleCancel();
    } catch (error) {
      enqueueSnackbar("An error occurred during registration", {
        variant: "error",
      });
    }
  };

  const selectedParents = parentOptions.filter((option) =>
    form.parent_ids?.includes(option.id),
  );

  const selectedClass =
    classOptions.find((option) => option.id === form.class_id) || null;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Create New Student"
        subtitle="Register a new student in your establishment"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Back to List
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Identity & Profile Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name *"
              value={form.firstName || ""}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name *"
              value={form.lastName || ""}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={form.gender || ""}
                label="Gender"
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dateOfBirth || ""}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Academic Institutional Data
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Student ID *"
              value={form.student_number || ""}
              onChange={(e) =>
                setForm({ ...form, student_number: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Enrollment Date *"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.enrollment_date || ""}
              onChange={(e) =>
                setForm({ ...form, enrollment_date: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={classOptions}
              value={selectedClass}
              getOptionLabel={(option) => option.className}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => {
                setForm({
                  ...form,
                  class_id: newValue ? newValue.id : "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Class"
                  placeholder="Select a class..."
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status *</InputLabel>
              <Select
                value={form.status || "active"}
                label="Status *"
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as StudentForm["status"],
                  })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="graduated">Graduated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Medical Notes (Allergies, chronic conditions, etc.)"
              value={form.medical_notes || ""}
              onChange={(e) =>
                setForm({ ...form, medical_notes: e.target.value })
              }
            />
            {form.medical_notes?.trim() && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: "error.shades",
                  border: "1px solid",
                  borderColor: "error.light",
                  borderRadius: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medicalConsentAccepted}
                      onChange={(e) =>
                        setMedicalConsentAccepted(e.target.checked)
                      }
                      color="error"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color="error.main"
                      fontWeight="500"
                    >
                      I confirm that the parents have provided signed explicit
                      consent to record these sensitive medical details. *
                    </Typography>
                  }
                />
                <FormHelperText error>
                  GDPR compliance: Health data requires explicit authorization
                  and must be restricted to authorized staff only.
                </FormHelperText>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Parents / Guardians Link
          </Typography>

          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => navigate("/parents/create")}
            color="success"
            sx={{ height: "30px", width: "auto" }}
          >
            Create new parent
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              options={parentOptions}
              value={selectedParents}
              getOptionLabel={(option) =>
                `${option.fullName} (${option.phone})`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => {
                setForm({
                  ...form,
                  parent_ids: newValue.map((parent) => parent.id),
                });
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option.id}
                      label={`${option.fullName} (${option.phone})`}
                      {...tagProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Parents / Guardians"
                  placeholder="Search and add parents..."
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon color="action" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
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
            for the academic and administrative management of the student within
            our establishment. It will not be shared with third parties without
            your explicit consent and will be retained in accordance with legal
            requirements.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rgpdAccepted}
                onChange={(e) => setRgpdAccepted(e.target.checked)}
                color="primary"
              />
            }
            label="I acknowledge that I have read and understood the data protection notice *"
          />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Reset Form
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={
              !rgpdAccepted ||
              (!!form.medical_notes?.trim() && !medicalConsentAccepted)
            }
          >
            Save Student
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateStudent;
