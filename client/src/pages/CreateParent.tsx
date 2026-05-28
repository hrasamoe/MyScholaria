import { useState } from "react";
import PageHeader from "@/components/PageHeader";
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";

interface ParentForm {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
}

const CreateParent = () => {
  const [form, setForm] = useState<Partial<ParentForm>>({
    gender: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    profession: "",
  });

  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleCancel = () => {
    setForm({
      gender: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      profession: "",
    });
    setRgpdAccepted(false);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
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

    try {
      enqueueSnackbar("Parent profile created successfully", {
        variant: "success",
      });
      handleCancel();
    } catch (error) {
      enqueueSnackbar("An error occurred during registration", {
        variant: "error",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Create New Parent Profile"
        subtitle="Register a new legal guardian account in the system"
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
          Personal Information
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
              label="Profession"
              value={form.profession || ""}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
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
              label="Phone Number *"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Home Address"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
            disabled={!rgpdAccepted}
          >
            Save Parent
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateParent;
