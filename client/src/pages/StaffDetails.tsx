import PageHeader from "@/components/PageHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface StaffDetail {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  position: string;
  department: string;
  hire_date: string;
  contract_type: "CDI" | "CDD" | "Vacataire" | "FRAM" | "Fonctionnaire";
  salary: number | null;
  status: "active" | "suspended" | "terminated";
}

const API_URL = import.meta.env.VITE_API_URL;

const DEPT_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#0097a7",
  "#c62828",
  "#e65100",
];

const getDepartmentColor = (name: string) => {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEPT_COLORS[hash % DEPT_COLORS.length];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "warning" | "error" }
> = {
  active: { label: "Active", color: "success" },
  suspended: { label: "Suspended", color: "warning" },
  terminated: { label: "Terminated", color: "error" },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatSalary = (amount: number | null) => {
  if (amount === null || amount === undefined) return "—";
  return `${new Intl.NumberFormat().format(amount)} MGA`;
};

const InfoRow = ({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    {loading ? (
      <Skeleton variant="text" width="60%" height={22} />
    ) : (
      <Typography variant="body2" mt={0.25}>
        {value ?? <span style={{ opacity: 0.4, fontStyle: "italic" }}>—</span>}
      </Typography>
    )}
  </Box>
);

const StaffDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/staff/details/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load staff data");
        }

        const data: StaffDetail = await res.json();
        setStaff(data);
      } catch (e: any) {
        enqueueSnackbar(e.message || "Error loading staff member", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStaffDetails();
  }, [id, enqueueSnackbar]);

  const statusCfg = STATUS_CONFIG[staff?.status ?? "active"];
  const fullName = staff ? `${staff.first_name} ${staff.last_name}` : "";

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Staff Profile"
        subtitle="Full administrative profile and professional records"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/staff/edit/${id}`)}
              disabled={loading}
            >
              Edit
            </Button>
          </Stack>
        }
      />

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          </>
        ) : (
          <>
            <Avatar
              src={
                staff?.gender?.toLowerCase() === "female"
                  ? "/female.png"
                  : "/male.png"
              }
              sx={{ width: 64, height: 64 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {fullName}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap">
                <Chip
                  label={statusCfg?.label ?? staff?.status}
                  color={statusCfg?.color ?? "default"}
                  size="small"
                />
                <Chip label={staff?.position} size="small" variant="outlined" />
                {staff?.department && (
                  <Chip
                    icon={<WorkIcon sx={{ fontSize: 14 }} />}
                    label={staff.department}
                    size="small"
                    sx={{
                      bgcolor: getDepartmentColor(staff.department),
                      color: "white",
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => navigate("/staff/create")}
              >
                New Staff
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Identity & Contact
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="First Name"
              value={staff?.first_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Last Name"
              value={staff?.last_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Gender" value={staff?.gender} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Date of Birth"
              value={formatDate(staff?.date_of_birth ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Email" value={staff?.email} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Phone" value={staff?.phone} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoRow label="Address" value={staff?.address} loading={loading} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Professional & Contractual Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Position"
              value={staff?.position}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Department
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={140} height={26} />
              ) : staff?.department ? (
                <Chip
                  label={staff.department}
                  size="small"
                  sx={{
                    bgcolor: getDepartmentColor(staff.department),
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  fontStyle="italic"
                >
                  —
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Hire Date"
              value={formatDate(staff?.hire_date ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Contract Type"
              value={staff?.contract_type}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Salary"
              value={formatSalary(staff?.salary ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Status
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={80} height={26} />
              ) : (
                <Chip
                  label={statusCfg?.label ?? staff?.status}
                  color={statusCfg?.color ?? "default"}
                  size="small"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back to List
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/staff/edit/${id}`)}
          disabled={loading}
        >
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default StaffDetails;
