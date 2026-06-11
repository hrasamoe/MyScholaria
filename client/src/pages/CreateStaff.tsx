import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StaffForm {
  firstName: string;
  lastName: string;
  position: string;
  departement: string;
  hire_date: string;
  contract_type: "permanent" | "contract" | "vacation";
  salary: string;
  gender: "male" | "female";
  address: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  status: "active" | "suspended" | "terminated";
}

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;
const API_URL = import.meta.env.VITE_API_URL;

const CreateStaff = () => {
  const [form, setForm] = useState<Partial<StaffForm>>({
    status: "active",
    hire_date: new Date().toISOString().split("T")[0],
    contract_type: "permanent",
    gender: "male",
    salary: "",
    position: "",
    departement: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";

  const handleCancel = () => {
    setForm({
      status: "active",
      hire_date: new Date().toISOString().split("T")[0],
      contract_type: "permanent",
      gender: "male",
      firstName: "",
      lastName: "",
      position: "",
      departement: "",
      salary: "",
      address: "",
      dateOfBirth: "",
      email: "",
      phone: "",
    });
    setRgpdAccepted(false);
  };

  const handleSave = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.position ||
      !form.departement ||
      !form.hire_date ||
      !form.contract_type ||
      !form.status ||
      !form.salary ||
      !form.dateOfBirth
    ) {
      enqueueSnackbar("Please fill all required fields (*)", {
        variant: "error",
      });
      return;
    }

    if (form.phone && !phoneRegex.test(form.phone)) {
      enqueueSnackbar("Invalid Madagascar phone number format", {
        variant: "error",
      });
      return;
    }

    if (!rgpdAccepted) {
      enqueueSnackbar("You must acknowledge the data protection notice", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        birth_date: form.dateOfBirth,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        position: form.position,
        departement: form.departement,
        hire_date: form.hire_date,
        contract_type: form.contract_type,
        salary: parseFloat(form.salary),
        status: form.status,
      };

      const response = await apiRequest(`/api/staff/create/${establishmentID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      enqueueSnackbar("Staff member created successfully", {
        variant: "success",
      });
      handleCancel();
      navigate(-1);
    } catch (error: any) {
      enqueueSnackbar(
        error.message || "An error occurred during registration",
        { variant: "error", autoHideDuration: 3000 },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Create New Staff"
        subtitle="Register a new staff member in your establishment"
        action={
          <Button
            variant="outlined"
            disabled={loading}
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back to List
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Identity & Personal Information
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
            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <FormLabel component="legend" sx={{ fontSize: "0.85rem" }}>
                Gender
              </FormLabel>
              <RadioGroup
                row
                value={form.gender || "male"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value as StaffForm["gender"],
                  })
                }
              >
                <FormControlLabel
                  value="male"
                  control={<Radio size="small" />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio size="small" />}
                  label="Female"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth *"
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
              error={!!form.phone && !phoneRegex.test(form.phone)}
              helperText={
                !!form.phone && !phoneRegex.test(form.phone)
                  ? "Expected format: +261 3X 11 987 65 or 03X 11 98 765"
                  : ""
              }
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
          Professional & Contractual Data
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Position *</InputLabel>
              <Select
                value={form.position || ""}
                label="Position *"
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                <MenuItem value="Principal">Principal</MenuItem>
                <MenuItem value="Administrative Assistant">
                  Administrative Assistant
                </MenuItem>
                <MenuItem value="Bursar">Bursar</MenuItem>
                <MenuItem value="Librarian">Librarian</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="School Nurse">School Nurse</MenuItem>
                <MenuItem value="Runner">Runner</MenuItem>
                <MenuItem value="School Custodian">School Custodian</MenuItem>
                <MenuItem value="Security Guard">Security Guard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Department *</InputLabel>
              <Select
                value={form.departement || ""}
                label="Department *"
                onChange={(e) =>
                  setForm({ ...form, departement: e.target.value })
                }
              >
                <MenuItem value="Direction & Administration">
                  Direction & Administration
                </MenuItem>
                <MenuItem value="Finance & Accounting">
                  Finance & Accounting
                </MenuItem>
                <MenuItem value="Student Life & Discipline">
                  Student Life & Discipline
                </MenuItem>
                <MenuItem value="Logistics & Transport">
                  Logistics & Transport
                </MenuItem>
                <MenuItem value="Health & Well-being">
                  Health & Well-being
                </MenuItem>
                <MenuItem value="Security & Maintenance">
                  Security & Maintenance
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Hire Date *"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.hire_date || ""}
              onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Contract Type *</InputLabel>
              <Select
                value={form.contract_type || "permanent"}
                label="Contract Type *"
                onChange={(e) =>
                  setForm({
                    ...form,
                    contract_type: e.target.value as StaffForm["contract_type"],
                  })
                }
              >
                <MenuItem value="permanent">Permanent</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="vacation">Vacation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Salary (MGA) *"
              type="number"
              value={form.salary || ""}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
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
                    status: e.target.value as StaffForm["status"],
                  })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Data Protection Notice
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The professional and personal data collected through this form is
            restricted to internal administrative use, payroll management, and
            institutional mapping.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rgpdAccepted}
                onChange={(e) => setRgpdAccepted(e.target.checked)}
                color={rgpdAccepted ? "success" : "primary"}
              />
            }
            label="I acknowledge that I have read and understood the data protection notice *"
          />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
        >
          <Button disabled={loading} variant="outlined" onClick={handleCancel}>
            Reset Form
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!rgpdAccepted || loading}
          >
            Save Staff
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateStaff;
