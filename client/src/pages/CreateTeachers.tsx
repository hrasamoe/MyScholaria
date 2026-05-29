import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
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

const CreateTeacher = () => {
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
    setRgpdAccepted(false);
    navigate("/teachers");
  };

  const handleSave = async () => {
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
        `${import.meta.env.VITE_API_URL}/api/teachers/create-teacher/${establishmentID}`,
        {
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
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An error occurred");
      }

      enqueueSnackbar("Teacher profile created successfully", {
        variant: "success",
      });
      handleCancel();
    } catch (error: any) {
      enqueueSnackbar(`${error.message || error}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name *"
              value={form.firstName || ""}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name *"
              value={form.lastName || ""}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl
              component="fieldset"
              disabled={loading}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "56px",
                borderRadius: 1,
                px: 2,
              }}
            >
              <FormLabel
                component="legend"
                sx={{
                  fontSize: "0.95rem",
                  color: "text.secondary",
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Main Subject *"
              value={form.subject || ""}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value as TeacherSubject })
              }
              disabled={loading}
            >
              {TEACHER_SUBJECTS.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>
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
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Home Address"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={loading}
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
    </Box>
  );
};

export default CreateTeacher;
