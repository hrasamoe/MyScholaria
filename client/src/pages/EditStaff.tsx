import PageHeader from "@/components/PageHeader";
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
  FormHelperText,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export type ContractType = "permanent" | "contract" | "vacation";

interface StaffForm {
  firstName: string;
  lastName: string;
  position: string;
  departement: string;
  hire_date: string;
  contract_type: ContractType | "";
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

const CONTRACT_TYPES: ContractType[] = ["permanent", "contract", "vacation"];

const EditStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<Partial<StaffForm>>({
    status: "active",
    gender: "male",
    firstName: "",
    lastName: "",
    email: "",
    hire_date: "",
    phone: "",
    address: "",
    position: "",
    departement: "",
    contract_type: "",
    salary: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setFetching(true);
        const response = await apiRequest(`/api/staff/details/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch staff details");
        }

        setForm({
          firstName: result.first_name || "",
          lastName: result.last_name || "",
          email: result.email || "",
          gender: result.gender || "male",
          dateOfBirth: result.date_of_birth
            ? result.date_of_birth.substring(0, 10)
            : "",
          phone: result.phone || "",
          address: result.address || "",
          position: result.position || "",
          departement: result.department || "",
          hire_date: result.hire_date ? result.hire_date.substring(0, 10) : "",
          contract_type: result.contract_type || "",
          salary:
            result.salary !== undefined && result.salary !== null
              ? result.salary.toString()
              : "",
          status: result.status || "active",
        });
        setRgpdAccepted(true);
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(error.message || "Error loading profile", {
          variant: "error",
        });
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchStaffDetails();
  }, [id, enqueueSnackbar]);

  const handleCancel = () => {
    navigate("/staff");
  };

  const handleSave = async () => {
    setErrors({});

    if (
      !form.firstName ||
      !form.lastName ||
      !form.position ||
      !form.departement ||
      !form.hire_date ||
      !form.contract_type ||
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

    setLoading(true);
    try {
      const response = await apiRequest(`/api/staff/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
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
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      enqueueSnackbar("Staff profile updated successfully", {
        variant: "success",
      });
      navigate(-1);
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
        title="Modify Staff Profile"
        subtitle="View and update information for this staff member"
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
          Identity & Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="First Name *"
                value={form.firstName || ""}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                disabled={loading}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Last Name *"
                value={form.lastName || ""}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                disabled={loading}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
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
                  value={form.gender || "male"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as StaffForm["gender"],
                    })
                  }
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
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                disabled={loading}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.birth_date}
                helperText={errors.birth_date}
              />
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Professional & Contractual Data
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                select
                fullWidth
                label="Position *"
                value={form.position || ""}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                disabled={loading}
                error={!!errors.position}
                helperText={errors.position}
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
              </TextField>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                select
                fullWidth
                label="Department *"
                value={form.departement || ""}
                onChange={(e) =>
                  setForm({ ...form, departement: e.target.value })
                }
                disabled={loading}
                error={!!errors.departement}
                helperText={errors.departement}
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
              </TextField>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Hire Date *"
                type="date"
                value={form.hire_date || ""}
                onChange={(e) =>
                  setForm({ ...form, hire_date: e.target.value })
                }
                disabled={loading}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.hire_date}
                helperText={errors.hire_date}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                select
                fullWidth
                label="Contract Type *"
                value={form.contract_type || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contract_type: e.target.value as ContractType,
                  })
                }
                disabled={loading}
                error={!!errors.contract_type}
                helperText={errors.contract_type}
              >
                {CONTRACT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.toUpperCase().charAt(0) + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Salary (MGA) *"
                type="number"
                value={form.salary || ""}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                disabled={loading}
                error={!!errors.salary}
                helperText={errors.salary}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                select
                fullWidth
                label="Status *"
                value={form.status || "active"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as StaffForm["status"],
                  })
                }
                disabled={loading}
                error={!!errors.status}
                helperText={errors.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </TextField>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Contact details & Address
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
                error={!!errors.phone}
                helperText={
                  errors.phone || "Format: +2613XXXXXXXX or 03XXXXXXXX"
                }
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
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
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Home Address"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={loading}
                error={!!errors.address}
                helperText={errors.address}
              />
            )}
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
          {fetching ? (
            <Skeleton variant="text" width="50%" height={24} />
          ) : (
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
          )}
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
        >
          {fetching ? (
            <>
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={140} height={36} />
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!rgpdAccepted || loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EditStaff;
