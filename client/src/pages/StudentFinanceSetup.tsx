import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface StudentFinanceSettings {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  base_monthly_tuition: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
  payment_plan: "standard" | "advance" | "full_year";
  notes: string;
}

export default function StudentFinanceSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StudentFinanceSettings>({
    student_id: "",
    first_name: "",
    last_name: "",
    student_number: "",
    base_monthly_tuition: 50000,
    discount_type: "none",
    discount_value: 0,
    payment_plan: "standard",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchFinanceSettings = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/api/finance/student-settings/${id}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else {
          setSettings((prev) => ({
            ...prev,
            student_id: id,
            first_name: "Heritiana",
            last_name: "Rasamoelina",
            student_number: "STD-2026-001",
          }));
        }
      } catch {
        enqueueSnackbar("Using template structure for configuration.", {
          variant: "info",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceSettings();
  }, [id, enqueueSnackbar]);

  const handleChange = (field: keyof StudentFinanceSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateFinalTuition = () => {
    const base = settings.base_monthly_tuition;
    if (settings.discount_type === "percentage") {
      return base - base * (settings.discount_value / 100);
    }
    if (settings.discount_type === "fixed") {
      return Math.max(0, base - settings.discount_value);
    }
    return base;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiRequest(`/api/finance/student-settings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          base_monthly_tuition: settings.base_monthly_tuition,
          discount_type: settings.discount_type,
          discount_value: settings.discount_value,
          payment_plan: settings.payment_plan,
          notes: settings.notes,
        }),
      });

      if (!res.ok) throw new Error();

      enqueueSnackbar("Financial configuration updated successfully", {
        variant: "success",
      });
      navigate(`/students/details/${id}`);
    } catch {
      enqueueSnackbar("Failed to push structural account adjustments.", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const finalMonthly = calculateFinalTuition();

  return (
    <Container sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <PageHeader
        title="Financial Configuration"
        subtitle="Manage custom fee structures, scholarship plans, and tuition baselines"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back to Profile
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {settings.first_name} {settings.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Student Matrix Reference: {settings.student_number}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Modifying these baselines will adjust the system generation
              parameters for upcoming generation runs in the current fiscal
              academic cycle.
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Standard Monthly Tuition Base"
                  type="number"
                  value={settings.base_monthly_tuition}
                  onChange={(e) =>
                    handleChange(
                      "base_monthly_tuition",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">AR</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Payment Strategy Mode"
                  value={settings.payment_plan}
                  onChange={(e) => handleChange("payment_plan", e.target.value)}
                >
                  <MenuItem value="standard">Standard Monthly Plan</MenuItem>
                  <MenuItem value="advance">Paid In Advance Structure</MenuItem>
                  <MenuItem value="full_year">
                    Full Year Core Clearance (Soldé)
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Scholarship / Discount Template"
                  value={settings.discount_type}
                  onChange={(e) => {
                    handleChange("discount_type", e.target.value);
                    handleChange("discount_value", 0);
                  }}
                >
                  <MenuItem value="none">No Reduction / Full Rate</MenuItem>
                  <MenuItem value="percentage">
                    Percentage Remission (%)
                  </MenuItem>
                  <MenuItem value="fixed">
                    Fixed Rate Subsidy Deductible (AR)
                  </MenuItem>
                </TextField>
              </Grid>

              {settings.discount_type !== "none" && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={
                      settings.discount_type === "percentage"
                        ? "Reduction Ratio"
                        : "Deductible Flat Sum"
                    }
                    type="number"
                    value={settings.discount_value}
                    onChange={(e) =>
                      handleChange(
                        "discount_value",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {settings.discount_type === "percentage" ? "%" : "AR"}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Calculated Net Net Tuition Value / Month:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {finalMonthly.toLocaleString()} AR
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Internal Billing Audit Trail & Justification Notes"
                  placeholder="Provide context regarding scholarship approval or custom rates..."
                  value={settings.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                Commit Plan Changes
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
