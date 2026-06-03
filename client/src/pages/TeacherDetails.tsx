import PageHeader from "@/components/PageHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
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

interface TeacherDetail {
  id: string;
  IDNumber: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  subject: string;
  qualification: string | null;
  contractType: string | null;
  hpw: number | null;
  hire_date: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECT_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#0097a7",
  "#c62828",
  "#e65100",
  "#00796b",
  "#5d4037",
  "#455a64",
];

const getSubjectColor = (name: string) => {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatContractType = (type: string | null) => {
  if (!type) return "—";
  return type.toUpperCase().charAt(0) + type.slice(1);
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

const TeacherDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTeacherDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/teachers/details/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load teacher data");
        }

        const data: TeacherDetail = await res.json();
        setTeacher(data);
      } catch (e: any) {
        enqueueSnackbar(e.message || "Error loading teacher profile", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherDetails();
  }, [id, enqueueSnackbar]);

  const fullName = teacher ? `${teacher.first_name} ${teacher.last_name}` : "";

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Teacher Profile"
        subtitle="Full administrative profile and educational metrics"
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
              onClick={() => navigate(`/teachers/edit/${id}`)}
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
                teacher?.gender?.toLowerCase() === "female"
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
                  label={`ID: ${teacher?.IDNumber}`}
                  size="small"
                  variant="outlined"
                />
                {teacher?.subject && (
                  <Chip
                    icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                    label={teacher.subject}
                    size="small"
                    sx={{
                      bgcolor: getSubjectColor(teacher.subject),
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
                onClick={() => navigate("/teachers/create")}
              >
                New Teacher
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Identification & Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="First Name"
              value={teacher?.first_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Last Name"
              value={teacher?.last_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Gender" value={teacher?.gender} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Qualification"
              value={teacher?.qualification}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Academic Assignment & Contract
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Hire Date"
              value={formatDate(teacher?.hire_date ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Main Subject
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={140} height={26} />
              ) : teacher?.subject ? (
                <Chip
                  label={teacher.subject}
                  size="small"
                  sx={{
                    bgcolor: getSubjectColor(teacher.subject),
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
              label="Contract Type"
              value={formatContractType(teacher?.contractType ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Hours Per Week"
              value={
                teacher?.hpw !== null && teacher?.hpw !== undefined
                  ? `${teacher.hpw} hrs`
                  : "—"
              }
              loading={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Contact Details & Address
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Phone Number"
              value={teacher?.phone}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Email Address"
              value={teacher?.email}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoRow
              label="Home Address"
              value={teacher?.address}
              loading={loading}
            />
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
          onClick={() => navigate(`/teachers/edit/${id}`)}
          disabled={loading}
        >
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default TeacherDetails;
