import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAcademicYear } from "@/hooks/useAcademicYear";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAcademicMonthLabels,
  getTuitionDueDate,
} from "@/config/Academicyear";

interface TuitionMonthOption {
  id: string;
  month: string;
  amount_due: number;
  is_paid: boolean;
}

interface StudentFinanceSettings {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  class_id: string;
  class_name: string;
  base_monthly_tuition: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
  total_paid_amount: number;
  registration_fee: number;
  is_registration_fee_paid: boolean;
  notes: string;
  tuition_months: TuitionMonthOption[];
}

// Default set of tuition installments, built from whatever
// startMonth/endMonth the caller passes in (sourced from the
// establishment's Academic Year settings).
const buildDefaultTuitionMonths = (
  startMonth: number,
  endMonth: number,
): TuitionMonthOption[] =>
  getAcademicMonthLabels(startMonth, endMonth).map((month, i) => ({
    id: String(i + 1),
    month,
    amount_due: 0,
    is_paid: false,
  }));

const formatDate = (date: Date | null) => {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function StudentFinanceSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    startMonth,
    endMonth,
    loaded: academicYearLoaded,
  } = useAcademicYear();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StudentFinanceSettings>({
    student_id: "",
    first_name: "",
    last_name: "",
    student_number: "",
    class_id: "",
    class_name: "",
    base_monthly_tuition: 0,
    discount_type: "none",
    discount_value: 0,
    total_paid_amount: 0,
    registration_fee: 0,
    is_registration_fee_paid: false,
    notes: "",
    tuition_months: [], // filled once academic year settings load
  });

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

  const finalMonthly = calculateFinalTuition();

  const getProcessedMonths = (paidAmount: number) => {
    let pool = paidAmount;
    return settings.tuition_months.map((m) => {
      if (finalMonthly <= 0) {
        return { ...m, amount_due: 0, is_paid: false };
      }
      if (pool >= finalMonthly) {
        pool -= finalMonthly;
        return { ...m, amount_due: 0, is_paid: true };
      } else if (pool > 0) {
        const remainder = finalMonthly - pool;
        pool = 0;
        return { ...m, amount_due: remainder, is_paid: false };
      } else {
        return { ...m, amount_due: finalMonthly, is_paid: false };
      }
    });
  };

  useEffect(() => {
    if (!id || !academicYearLoaded) return;
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [detailsRes, financeRes, rulesRes] = await Promise.all([
          apiRequest(`/api/students/details/${id}`, { credentials: "include" }),
          apiRequest(`/api/finance/student-settings/${id}`, {
            credentials: "include",
          }),
          apiRequest(`/api/finance/tuition-rules`, { credentials: "include" }),
        ]);

        let studentProfile = {
          first_name: "",
          last_name: "",
          student_number: "",
          class_id: "",
          class_name: "",
        };

        let defaultTuitionFromRules = 0;
        let defaultRegistrationFee = 0;

        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          studentProfile = {
            first_name: detailsData.first_name || "",
            last_name: detailsData.last_name || "",
            student_number: detailsData.student_number || "",
            class_id: detailsData.class_id || "",
            class_name: detailsData.class_name || "N/A",
          };
        }

        if (rulesRes.ok && studentProfile.class_id) {
          const rulesData = await rulesRes.json();
          const matchedRule = rulesData.find(
            (r: any) => r.class_id === studentProfile.class_id,
          );
          if (matchedRule) {
            defaultTuitionFromRules = matchedRule.tuition_fee || 0;
            defaultRegistrationFee = matchedRule.registration_fee || 0;
          }
        }

        if (financeRes.ok) {
          const financeData = await financeRes.json();
          setSettings((prev) => ({
            ...prev,
            ...financeData,
            ...studentProfile,
            student_id: id,
            base_monthly_tuition:
              financeData.base_monthly_tuition || defaultTuitionFromRules,
            registration_fee:
              financeData.registration_fee || defaultRegistrationFee,
            // Fall back to the establishment's configured academic-year
            // months if this student doesn't have a saved schedule yet.
            tuition_months:
              financeData.tuition_months?.length > 0
                ? financeData.tuition_months
                : buildDefaultTuitionMonths(startMonth, endMonth),
          }));
        } else {
          setSettings((prev) => ({
            ...prev,
            ...studentProfile,
            student_id: id,
            base_monthly_tuition: defaultTuitionFromRules,
            registration_fee: defaultRegistrationFee,
            tuition_months: buildDefaultTuitionMonths(startMonth, endMonth),
          }));
        }
      } catch (error) {
        console.error("Error loading student parameters:", error);
        enqueueSnackbar("Error synchronizing structural data.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, startMonth, endMonth, academicYearLoaded, enqueueSnackbar]);

  const handleChange = (field: keyof StudentFinanceSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMonthCheckChange = (monthId: string, isChecked: boolean) => {
    setSettings((prev) => {
      const updatedMonths = prev.tuition_months.map((m) => {
        if (m.id === monthId) {
          return {
            ...m,
            is_paid: isChecked,
            amount_due: isChecked ? 0 : finalMonthly,
          };
        }
        return m;
      });
      return { ...prev, tuition_months: updatedMonths };
    });
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
          total_paid_amount: settings.total_paid_amount,
          registration_fee: settings.registration_fee,
          is_registration_fee_paid: settings.is_registration_fee_paid,
          notes: settings.notes,
          tuition_months: processedMonths,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error(
          "Save failed:",
          res.status,
          JSON.stringify(errBody, null, 2),
        );
        throw new Error(errBody?.error || "Save failed");
      }

      enqueueSnackbar("Financial configuration updated successfully", {
        variant: "success",
      });
      navigate(`/students/details/${id}`);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to push structural account adjustments.", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };
  const processedMonths = getProcessedMonths(settings.total_paid_amount);
  const totalDueAcademicYear = finalMonthly * settings.tuition_months.length;
  const currentRemainingBalance = Math.max(
    0,
    totalDueAcademicYear - settings.total_paid_amount,
  );

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

      <Paper
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
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
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Student Matrix Reference: {settings.student_number}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Assigned Classroom: <strong>{settings.class_name}</strong>
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Base Registration Fee"
                  type="number"
                  value={settings.registration_fee}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">AR</InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid
                size={{ xs: 12, sm: 6 }}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.is_registration_fee_paid}
                      onChange={(e) =>
                        handleChange(
                          "is_registration_fee_paid",
                          e.target.checked,
                        )
                      }
                    />
                  }
                  label="Registration fee already paid"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Standard Monthly Tuition Base"
                  type="number"
                  value={settings.base_monthly_tuition}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">AR</InputAdornment>
                      ),
                    },
                  }}
                />
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
                    value={
                      settings.discount_value === 0
                        ? ""
                        : settings.discount_value
                    }
                    onChange={(e) =>
                      handleChange(
                        "discount_value",
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                      )
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {settings.discount_type === "percentage"
                              ? "%"
                              : "AR"}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amount paid by student"
                  type="number"
                  value={
                    settings.total_paid_amount === 0
                      ? ""
                      : settings.total_paid_amount
                  }
                  onChange={(e) =>
                    handleChange(
                      "total_paid_amount",
                      e.target.value === "" ? 0 : parseFloat(e.target.value),
                    )
                  }
                  helperText="Enter the total amount provided by the student."
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">AR</InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Remaining Academic Balance:
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={
                      currentRemainingBalance > 0
                        ? "error.main"
                        : "success.main"
                    }
                  >
                    {currentRemainingBalance.toLocaleString()} AR /{" "}
                    {totalDueAcademicYear.toLocaleString()} AR
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Chronological Monthly Status Coverages:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  {processedMonths.map((m) => {
                    const canCheckManual =
                      settings.total_paid_amount >= finalMonthly;
                    const dueDate = getTuitionDueDate(
                      m.month,
                      startMonth,
                      endMonth,
                    );
                    const isOverdue = !m.is_paid && dueDate < new Date();

                    return (
                      <Box
                        key={m.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: 0 },
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={m.is_paid}
                              disabled={!m.is_paid && !canCheckManual}
                              onChange={(e) =>
                                handleMonthCheckChange(m.id, e.target.checked)
                              }
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={500}>
                              {m.month}
                            </Typography>
                          }
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 0.25,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color={isOverdue ? "error.main" : "text.secondary"}
                            fontWeight={isOverdue ? 600 : 400}
                          >
                            {m.is_paid
                              ? "Paid"
                              : m.amount_due < finalMonthly
                                ? `Remaining: ${m.amount_due.toLocaleString()} AR`
                                : `Due: ${finalMonthly.toLocaleString()} AR`}
                            {isOverdue && " — Overdue"}
                          </Typography>
                          {!m.is_paid && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontSize: 11 }}
                            >
                              Due by {formatDate(dueDate)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
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
