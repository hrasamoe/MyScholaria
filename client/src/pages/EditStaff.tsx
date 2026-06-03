import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
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
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface StaffForm {
  firstName: string;
  lastName: string;
  position: string;
  department: string;
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

const EditStaff = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";

  const [form, setForm] = useState<Partial<StaffForm>>({
    status: "active",
    hire_date: "",
    contract_type: "permanent",
    gender: "male",
    salary: "",
    position: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/staff/details/${id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setForm({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          gender: data.gender || "male",
          dateOfBirth: data.date_of_birth
            ? data.date_of_birth.split("T")[0]
            : "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          position: data.position || "",
          department: data.department || "",
          hire_date: data.hire_date ? data.hire_date.split("T")[0] : "",
          contract_type: data.contract_type || "CDI",
          salary: data.salary ? String(data.salary) : "",
          status: data.status || "active",
        });
        setRgpdAccepted(true);
      } catch {
        enqueueSnackbar("Error loading staff details", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id, enqueueSnackbar]);

  const handleReset = () => {
    if (!id) return;
    navigate(0);
  };

  const handleSave = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.position ||
      !form.department ||
      !form.hire_date ||
      !form.contract_type ||
      !form.status
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
        position: form.position,
        department: form.department,
        hire_date: form.hire_date,
        contract_type: form.contract_type,
        salary: form.salary ? parseFloat(form.salary) : null,
        gender: form.gender || null,
        address: form.address || null,
        dateOfBirth: form.dateOfBirth || null,
        email: form.email || null,
        phone: form.phone || null,
        status: form.status || "active",
      };

      const response = await fetch(`${API_URL}/api/staff/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      enqueueSnackbar("Staff member updated successfully", {
        variant: "success",
      });
      navigate(-1);
    } catch (error: any) {
      enqueueSnackbar(error.message || "An error occurred during update", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Edit Staff Profile"
        subtitle="Modify information and updates for this staff member"
        action={
          <Button
            variant="outlined"
            disabled={loading}
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        {loading ? (
          <Box>
            <Skeleton variant="text" width={250} height={32} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={40} sx={{ mt: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Skeleton variant="text" width={250} height={32} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={400} height={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Identity & Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={form.firstName || ""}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={form.lastName || ""}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
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
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                  >
                    <MenuItem value="Principal">Principal</MenuItem>
                    <MenuItem value="Administrative Assistant">
                      Administrative Assistant
                    </MenuItem>
                    <MenuItem value="Bursar">Bursar</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="School Nurse">School Nurse</MenuItem>
                    <MenuItem value="Runner">Runner</MenuItem>
                    <MenuItem value="School Custodian">
                      School Custodian
                    </MenuItem>
                    <MenuItem value="Security Guard">Security Guard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={form.department || ""}
                    label="Department *"
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
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
                    <MenuItem value="Vie Scolaire">
                      Vie Scolaire & Discipline
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
                  onChange={(e) =>
                    setForm({ ...form, hire_date: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Contract Type *</InputLabel>
                  <Select
                    value={form.contract_type || "CDI"}
                    label="Contract Type *"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contract_type: e.target
                          .value as StaffForm["contract_type"],
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
                  label="Salary (MGA)"
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
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Data Protection Notice
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The professional and personal data collected through this form
                is restricted to internal administrative use, payroll
                management, and institutional mapping.
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
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button variant="outlined" onClick={handleReset}>
                Reset Changes
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!rgpdAccepted || loading}
              >
                Update Staff
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default EditStaff;
