import PageHeader from "@/components/PageHeader";
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
import { TeacherSubject } from "./Teachers";

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

const TEACHER_SUBJECTS: TeacherSubject[] = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "French",
  "Malagasy",
  "Phylosophy",
  "History & Geography",
  "Computer Science",
  "Physical Education",
  "Art & Music",
];

const CONTRACT_TYPES: ContractType[] = ["permanent", "contract", "vacation"];

const EditTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<Partial<TeacherForm>>({
    idNumber: "",
    gender: "",
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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        setFetching(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/teachers/details/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch teacher details");
        }

        setForm({
          idNumber: result.IDNumber || "",
          firstName: result.first_name || "",
          lastName: result.last_name || "",
          email: result.email || "",
          gender: result.gender || "",
          hire_date: result.hire_date
            ? (() => {
                const cleanDate = result.hire_date.substring(0, 10);
                const parts = cleanDate.split("-");

                if (parts[0].length === 4) {
                  return cleanDate;
                }

                const [month, day, year] = parts;
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
              })()
            : "",
          subject: result.subject || "",
          qualification: result.qualification || "",
          phone: result.phone || "",
          address: result.address || "",
          contractType: result.contractType || "",
          hoursPerDay:
            result.hpw !== undefined && result.hpw !== null
              ? Math.round(Number(result.hpw)).toString()
              : "0",
        });
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(error.message || "Error loading profile", {
          variant: "error",
        });
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchTeacherDetails();
  }, [id]);

  const handleCancel = () => {
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

    if (!rgpdAccepted) {
      enqueueSnackbar("You must acknowledge the data protection notice", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/teachers/update/${id}`,
        {
          method: "PUT",
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
            subject: form.subject,
            phone: form.phone,
            address: form.address,
            hire_date: form.hire_date,
            qualification: form.qualification,
            contractType: form.contractType,
            hpw: form.hoursPerDay ? parseInt(form.hoursPerDay) : 0,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      enqueueSnackbar("Teacher profile updated successfully", {
        variant: "success",
      });
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
        title="Modify Teacher Profile"
        subtitle="View and update information for this educator"
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
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="ID Number *"
                value={form.idNumber || ""}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                disabled
                error={!!errors.IDNumber}
                helperText={errors.IDNumber}
              />
            )}
          </Grid>
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
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Qualification"
                value={form.qualification || ""}
                onChange={(e) =>
                  setForm({ ...form, qualification: e.target.value })
                }
                disabled={loading}
              />
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Academic Assignment & Contract
        </Typography>
        <Grid container spacing={3}>
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
                label="Main Subject *"
                value={form.subject || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subject: e.target.value as TeacherSubject,
                  })
                }
                disabled={loading}
                error={!!errors.subject}
                helperText={errors.subject}
              >
                {TEACHER_SUBJECTS.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
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
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
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
            Data Protection Notice (RGPD)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The personal data collected through this form is strictly intended
            for professional, academic, and administrative management within our
            establishment. It will not be shared with third parties without your
            explicit consent and will be retained in accordance with legal
            durations defined by data protection regulations.
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

export default EditTeacher;
