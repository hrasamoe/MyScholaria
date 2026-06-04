import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
  status: "active" | "expelled" | "transferred" | "graduated";
  medical_notes: string;
  parent_ids: string[];
}

interface ParentOption {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

interface ClassOption {
  id: string;
  name: string;
}

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;
const API_URL = import.meta.env.VITE_API_URL;

const EditStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";

  const [form, setForm] = useState<Partial<StudentForm>>({
    status: "active",
    enrollment_date: "",
    parent_ids: [],
    class_id: "",
    medical_notes: "",
    phone: "",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [medicalConsentAccepted, setMedicalConsentAccepted] = useState(false);
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const [resClasses, resParents] = await Promise.all([
          fetch(
            `${API_URL}/api/establishment/classes-list/${establishmentID}`,
            { credentials: "include" },
          ),
          fetch(`${API_URL}/api/utils/get-parent-list/${establishmentID}`, {
            credentials: "include",
          }),
        ]);
        if (resClasses.ok) setClassOptions(await resClasses.json());
        if (resParents.ok) setParentOptions(await resParents.json());
      } catch {
        enqueueSnackbar("Error loading context data from API", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar, establishmentID]);

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/students/details/${id}`, {
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
          student_number: data.student_number || "",
          enrollment_date: data.enrollment_date
            ? data.enrollment_date.split("T")[0]
            : "",
          class_id: data.class_id ? String(data.class_id) : "",
          status: data.status || "active",
          medical_notes: data.medical_notes || "",
          parent_ids: data.parents?.map((p: { id: string }) => p.id) || [],
        });
        if (data.medical_notes?.trim()) {
          setMedicalConsentAccepted(true);
        }
        setRgpdAccepted(true);
      } catch {
        enqueueSnackbar("Error loading student details", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, enqueueSnackbar]);

  const handleReset = () => {
    if (!id) return;
    navigate(0);
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

    if (form.phone && !phoneRegex.test(form.phone)) {
      enqueueSnackbar("Invalid Madagascar phone number format", {
        variant: "error",
      });
      return;
    }

    if (form.medical_notes?.trim() && !medicalConsentAccepted) {
      enqueueSnackbar(
        "You must obtain explicit consent to save health-related data",
        { variant: "warning" },
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
      setLoading(true);
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || null,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        student_number: form.student_number,
        enrollment_date: form.enrollment_date,
        class_id: form.class_id || undefined,
        status: form.status || "active",
        medical_notes: form.medical_notes || undefined,
        parent_ids: form.parent_ids || [],
      };

      const response = await fetch(`${API_URL}/api/students/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      enqueueSnackbar("Student updated successfully", { variant: "success" });
      navigate(-1);
    } catch (error: any) {
      enqueueSnackbar(error.message || "An error occurred during update", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatParentName = (parent: ParentOption) => {
    if (!parent) return "";
    const firstName = parent.first_name || "";
    const lastName = parent.last_name || "";
    const parts = firstName.trim().split(/\s+/);
    const formattedFirst =
      parts.length <= 1
        ? parts[0]
        : `${parts[0]} ${parts
            .slice(1)
            .map((p) => `${p[0].toUpperCase()}.`)
            .join(" ")}`;
    return `${formattedFirst} ${lastName}`.trim();
  };

  const selectedParents = parentOptions.filter((o) =>
    form.parent_ids?.includes(o.id),
  );

  const selectedClass =
    classOptions.find((o) => String(o.id) === String(form.class_id)) || null;

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Edit Student Profile"
        subtitle="Modify information and updates for this student"
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
              <Grid size={{ xs: 12 }}>
                <Skeleton variant="rounded" height={80} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="rounded" width={140} height={30} />
            </Box>
            <Skeleton variant="rounded" height={56} />
            <Divider sx={{ my: 4 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={400} height={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Identity & Profile Information
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
                    value={form.gender || ""}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
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
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    String(option.id) === String(value.id)
                  }
                  onChange={(_, newValue) =>
                    setForm({
                      ...form,
                      class_id: newValue ? String(newValue.id) : "",
                    })
                  }
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
                    <MenuItem value="expelled">Expelled</MenuItem>
                    <MenuItem value="transferred">Transferred</MenuItem>
                    <MenuItem value="graduated">Graduated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
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
                      bgcolor: medicalConsentAccepted
                        ? "success.shades"
                        : "error.shades",
                      border: "1px solid",
                      borderColor: medicalConsentAccepted
                        ? "success.light"
                        : "error.light",
                      borderRadius: 1,
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={medicalConsentAccepted}
                          onChange={(e) =>
                            setMedicalConsentAccepted(e.target.checked)
                          }
                          color={medicalConsentAccepted ? "success" : "error"}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          color={
                            medicalConsentAccepted
                              ? "success.main"
                              : "error.main"
                          }
                          fontWeight="500"
                        >
                          I confirm that the parents have provided signed
                          explicit consent to record these sensitive medical
                          details. *
                        </Typography>
                      }
                    />
                    <FormHelperText
                      error={!medicalConsentAccepted}
                      sx={{
                        color: medicalConsentAccepted
                          ? "success.main"
                          : "error.main",
                      }}
                    >
                      GDPR compliance: Health data requires explicit
                      authorization and must be restricted to authorized staff
                      only.
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
                sx={{ height: "30px" }}
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
                  getOptionLabel={(option) => formatParentName(option)}
                  isOptionEqualToValue={(option, value) =>
                    String(option.id) === String(value.id)
                  }
                  onChange={(_, newValue) =>
                    setForm({
                      ...form,
                      parent_ids: newValue.map((p) => String(p.id)),
                    })
                  }
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <Box
                        component="li"
                        key={option.id}
                        {...optionProps}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <img
                          src={
                            option.gender === "male"
                              ? "/male.png"
                              : "/female.png"
                          }
                          alt={option.gender}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2">
                          {formatParentName(option)}
                        </Typography>
                      </Box>
                    );
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={option.id}
                          avatar={
                            <img
                              src={
                                option.gender === "male"
                                  ? "/male.png"
                                  : "/female.png"
                              }
                              alt={option.gender}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                              }}
                            />
                          }
                          label={formatParentName(option)}
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
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Data Protection Notice (GDPR)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The personal data collected through this form is strictly
                intended for the academic and administrative management of the
                student within our establishment. You can exercise your rights
                (access, rectification, erasure) by contacting our Data
                Protection Officer. Read our full{" "}
                <a
                  href="/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  Privacy Policy
                </a>
                .
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
                disabled={
                  !rgpdAccepted ||
                  (!!form.medical_notes?.trim() && !medicalConsentAccepted)
                }
              >
                Update Student
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default EditStudent;
