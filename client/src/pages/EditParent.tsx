import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
  FormControlLabel,
  Checkbox,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";

interface ParentForm {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
}

const EditParent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<Partial<ParentForm>>({
    gender: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    profession: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  useEffect(() => {
    const fetchParentDetails = async () => {
      try {
        setFetching(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/utils/get-parent-details/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch parent details");
        }

        setForm({
          firstName: result.first_name || "",
          lastName: result.last_name || "",
          email: result.email || "",
          gender: result.gender || "",
          profession: result.profession || "",
          phone: result.phone || "",
          address: result.address || "",
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

    if (id) fetchParentDetails();
  }, [id]);

  const handleCancel = () => {
    navigate("/parents");
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

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/utils/update-parent/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            gender: form.gender,
            profession: form.profession,
            phone: form.phone,
            address: form.address,
            fullname: form.firstName + " " + form.lastName,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An error occurred");
      }

      enqueueSnackbar("Parent profile updated successfully", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(`${error.message || error}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Modify Parent Profile"
        subtitle="View and update information for this legal guardian"
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
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {fetching ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <TextField
                fullWidth
                label="Profession"
                value={form.profession || ""}
                onChange={(e) =>
                  setForm({ ...form, profession: e.target.value })
                }
                disabled={loading}
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
                label="Phone Number *"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
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
            for the academic and administrative management of the student within
            our establishment. It will not be shared with third parties without
            your explicit consent and will be retained in accordance with legal
            requirements.
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
    </Box>
  );
};

export default EditParent;
